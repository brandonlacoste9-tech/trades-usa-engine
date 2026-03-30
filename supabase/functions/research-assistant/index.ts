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
  limit = 5
): Promise<string> {
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
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  const data = await res.json();
  if (!res.ok) return `Search error: ${JSON.stringify(data)}`;

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

  const data = await res.json();
  if (!res.ok) return `Scrape error: ${JSON.stringify(data)}`;

  const md = data.data?.markdown ?? "";
  // Truncate to keep within context window
  return md.slice(0, 8000) || "No content extracted.";
}

/* ─── Tool definitions for OpenAI ─── */

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description:
        "Search the web for real-time information about building permits, contractors, market trends, or any topic. Returns scraped & summarised results from multiple pages.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query, e.g. 'new construction permits Miami FL 2025'",
          },
          limit: {
            type: "number",
            description: "Max results to return (1-10). Default 5.",
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
        "Scrape and extract the main content from a specific URL. Returns the page content as clean markdown. Useful for reading permit databases, contractor profiles, or news articles.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL to scrape, e.g. 'https://austintexas.gov/building-permits'",
          },
        },
        required: ["url"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are the **Trades-USA Research Assistant** — an elite AI market intelligence agent built for contractors and trade professionals operating across the United States.

Your capabilities:
- **search_web**: Search the internet for building permits, market data, contractor information, zoning changes, and industry trends.
- **scrape_page**: Extract detailed data from specific webpages, permit databases, government sites, and contractor directories.

Guidelines:
1. When a user asks about permits, projects, or market data — USE YOUR TOOLS. Always search or scrape rather than relying on training data alone.
2. Present data in a structured, actionable format. Use tables, bullet points, and clear categorization.
3. Highlight high-value opportunities (projects >$50k, elite ZIP codes, hot trades like solar/HVAC/roofing).
4. Always cite your sources with URLs when presenting scraped data.
5. If a query is vague, ask one clarifying question before proceeding.
6. Focus on actionable intelligence: lead quality, project timelines, estimated values, and competition density.
7. You can chain multiple tool calls — e.g., search first to find relevant pages, then scrape specific results for deeper data.

You are direct, data-driven, and focused on helping contractors win more high-value projects.`;

/* ─── Main handler ─── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages: userMessages } = await req.json();

    // Build conversation with system prompt
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    // Agentic loop: keep calling OpenAI until we get a final text response
    let iterations = 0;
    const MAX_ITERATIONS = 6;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const completionRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: conversationMessages,
            tools: TOOLS,
            tool_choice: "auto",
            stream: false, // We stream the final answer only
          }),
        }
      );

      const completionData = await completionRes.json();
      if (!completionRes.ok) {
        return new Response(
          JSON.stringify({ error: "OpenAI error", details: completionData }),
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

      // If no tool calls, we have the final answer
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // Stream the final response
        const finalContent = assistantMessage.content || "";

        const streamRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: conversationMessages,
              tools: TOOLS,
              tool_choice: "none", // Force text-only for streaming
              stream: true,
            }),
          }
        );

        if (!streamRes.ok || !streamRes.body) {
          return new Response(
            JSON.stringify({ content: finalContent }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Pass through the SSE stream
        return new Response(streamRes.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      // We have tool calls — execute them
      conversationMessages.push(assistantMessage);

      const toolCalls: ToolCall[] = assistantMessage.tool_calls;

      for (const tc of toolCalls) {
        let result: string;
        try {
          const args = JSON.parse(tc.function.arguments);

          if (tc.function.name === "search_web") {
            console.log(`[Research] Searching: "${args.query}"`);
            result = await firecrawlSearch(firecrawlKey, args.query, args.limit || 5);
          } else if (tc.function.name === "scrape_page") {
            console.log(`[Research] Scraping: ${args.url}`);
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

      // Loop continues — OpenAI will process tool results and either call more tools or respond
    }

    // Max iterations reached
    return new Response(
      JSON.stringify({ error: "Max tool iterations reached" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Research assistant error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
