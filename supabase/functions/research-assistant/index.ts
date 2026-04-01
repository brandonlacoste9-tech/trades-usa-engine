import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

/* ─── Firecrawl helpers ─── */

async function firecrawlSearch(
  apiKey: string,
  query: string,
  requestedLimit = 5
): Promise<string> {
  // HARD SAFETY: Never allow more than 5 results in a search, regardless of AI request.
  const limit = Math.min(requestedLimit || 5, 5);
  
  console.log(`[Firecrawl] Executing search for: "${query}" with limit: ${limit}`);

  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      lang: "en",
      country: "us",
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    console.error(`[Firecrawl] Search error:`, data);
    return `Search error: ${JSON.stringify(data)}`;
  }

  const data = await res.json();
  const results = (data.data ?? [])
    .map(
      (r: any, i: number) =>
        `[${i + 1}] ${r.title ?? "Untitled"}\n    URL: ${r.url}\n    ${(r.markdown ?? r.description ?? "").slice(0, 600)}`
    )
    .join("\n\n");

  return results || "No results found.";
}

async function firecrawlScrape(
  apiKey: string,
  url: string
): Promise<string> {
  console.log(`[Firecrawl] Scraping URL: ${url}`);
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    console.error(`[Firecrawl] Scrape error:`, data);
    return `Scrape error: ${JSON.stringify(data)}`;
  }

  const data = await res.json();
  const md = data.data?.markdown ?? "";
  // Truncate to keep within context window
  return md.slice(0, 8000) || "No content extracted.";
}

/* ─── Tool definitions for OpenAI/DeepSeek ─── */

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description:
        "Search the web for building permits, contractors, or market trends. STRICT LIMIT: Returning more than 5 results is forbidden to save credits.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query, e.g. 'new construction permits Beverly Hills 2025'",
          },
          limit: {
            type: "number",
            description: "Max results. HARD CAP: 5. Do not exceed.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scrape_page",
      description:
        "Scrape the main content from a specific URL. Use only when search snippets are insufficient. Highly credit-efficient.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL to scrape.",
          },
        },
        required: ["url"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are the **Trades-USA Research Assistant**.
Your goal is to provide high-quality market intelligence while being EXTREMELY CREDIT-EFFICIENT.

Guidelines:
1. FIRECRAWL CREDITS ARE EXPENSIVE. Never perform redundant searches.
2. If a user asks for a broad area (e.g., "Los Angeles"), start with ONE focused search. Do NOT try to scrape hundreds of pages.
3. Your search_web tool is hard-capped at 5 results. Do not ask for more.
4. Always prioritize quality over quantity. One well-scraped permit database is better than 10 generic search results.
5. If you reach the info you need, stop immediately and summarize.
6. CITE YOUR SOURCES.

You help contractors win high-value projects without wasting resources.`;

/* ─── Main handler ─── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages: userMessages } = await req.json();

    // ─── AUTH & SUBSCRIPTION GUARD ───
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session", details: authError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription plan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("subscription_plan")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile || profile.subscription_plan === "web_starter") {
      return new Response(
        JSON.stringify({ 
          error: "SUBSCRIPTION_REQUIRED", 
          message: "The AI Research Assistant is only available on paid plans (Lead Engine or higher). Please upgrade your subscription to continue." 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // ─────────────────────────────────

    const conversationMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY")!;

    let iterations = 0;
    const MAX_ITERATIONS = 6;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const completionRes = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${deepseekKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: conversationMessages,
            tools: TOOLS,
            tool_choice: "auto",
            stream: false,
          }),
        }
      );

      const completionData = await completionRes.json();
      if (!completionRes.ok) {
        return new Response(
          JSON.stringify({ error: "DeepSeek error", details: completionData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const choice = completionData.choices?.[0];
      if (!choice) {
        return new Response(
          JSON.stringify({ error: "No response from AI" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const assistantMessage = choice.message;

      // Case 1: Final answer
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        const streamRes = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${deepseekKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: conversationMessages,
              tools: TOOLS,
              tool_choice: "none",
              stream: true,
            }),
          }
        );

        if (!streamRes.ok || !streamRes.body) {
          return new Response(
            JSON.stringify({ content: assistantMessage.content || "" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(streamRes.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      // Case 2: Tool calls
      conversationMessages.push(assistantMessage);

    // HARD SAFETY: Limit tool calls per turn and overall
    const toolCalls = (assistantMessage.tool_calls as any[]).slice(0, 3);
    
    for (const tc of toolCalls) {
      // Increment a global counter if we had one, but for now we'll just be strict per turn
      let result: string;
      try {
        const args = JSON.parse(tc.function.arguments);
        if (tc.function.name === "search_web") {
          // IMPORTANT: scrapeOptions removed to save credits. Search only returns snippets now.
          result = await firecrawlSearch(firecrawlKey, args.query, args.limit);
        } else if (tc.function.name === "scrape_page") {
          result = await firecrawlScrape(firecrawlKey, args.url);
        } else {
          result = `Unknown tool: ${tc.function.name}`;
        }
      } catch (e) {
        result = `Tool execution error: ${e instanceof Error ? e.message : String(e)}`;
      }

      conversationMessages.push({
        role: "tool",
        content: result,
        tool_call_id: tc.id,
      });
    }
      // Re-loop with tool results
    }

    return new Response(
      JSON.stringify({ error: "Max iterations reached" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Research assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
