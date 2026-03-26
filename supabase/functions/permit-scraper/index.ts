const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TARGETS = [
  {
    query: "recent building permits site:austintexas.gov OR site:permitsonline.com Austin TX",
    city: "Austin",
    state: "TX",
  },
  {
    query: "recent building permits site:miamidade.gov OR site:miami-dade.gov Miami FL",
    city: "Miami",
    state: "FL",
  },
];

const PERMIT_SCHEMA = {
  type: "object" as const,
  properties: {
    permits: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          permit_no: { type: "string" as const, description: "Permit or application number" },
          desc: { type: "string" as const, description: "Description of work" },
          value: { type: "number" as const, description: "Estimated project value in USD, 0 if unknown" },
          zip: { type: "string" as const, description: "5-digit ZIP code" },
          address: { type: "string" as const, description: "Street address" },
          owner_name: { type: "string" as const, description: "Property owner name if available" },
          project_type: { type: "string" as const, description: "Category: residential, commercial, solar, hvac, roofing, remodel, other" },
          date: { type: "string" as const, description: "Issue or application date in YYYY-MM-DD" },
        },
        required: ["permit_no", "desc"],
      },
    },
  },
  required: ["permits"],
};

function computeHeatScore(permit: {
  value: number;
  zip: string;
  project_type: string;
}): number {
  let score = 40; // baseline

  // Value scoring
  if (permit.value >= 250_000) score += 40;
  else if (permit.value >= 100_000) score += 30;
  else if (permit.value >= 50_000) score += 20;
  else if (permit.value > 0) score += 10;

  // Elite ZIP codes
  const eliteZips = ["90210", "33139", "78701", "33109", "78703", "77005", "85253", "92037"];
  if (eliteZips.includes(permit.zip)) score += 15;

  // High-demand trades
  const hotTypes = ["solar", "hvac", "roofing", "remodel"];
  if (hotTypes.includes(permit.project_type?.toLowerCase())) score += 5;

  return Math.min(score, 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Allow body to specify which cities or use defaults
    let targets = TARGETS;
    try {
      const body = await req.json();
      if (body?.targets?.length) targets = body.targets;
    } catch {
      // no body, use defaults
    }

    let totalInserted = 0;
    const errors: string[] = [];

    for (const target of targets) {
      console.log(`Scraping permits for ${target.city}, ${target.state}...`);

      // Use Firecrawl search with JSON extraction
      const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: target.query,
          limit: 5,
          lang: "en",
          country: "us",
          scrapeOptions: {
            formats: [
              "markdown",
              {
                type: "json",
                schema: PERMIT_SCHEMA,
                prompt: `Extract building permit data from this page. Look for permit numbers, descriptions of work, estimated values in USD, ZIP codes, addresses, owner names, and project types. If a field is not available, use empty string or 0 for value.`,
              },
            ],
          },
        }),
      });

      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        console.error(`Firecrawl search error for ${target.city}:`, searchData);
        errors.push(`${target.city}: ${searchData.error || searchRes.status}`);
        continue;
      }

      const results = searchData.data ?? [];
      console.log(`Got ${results.length} search results for ${target.city}`);

      for (const result of results) {
        const extracted = result.json?.permits ?? result.extract?.permits ?? [];

        for (const p of extracted) {
          if (!p.permit_no || p.permit_no === "") continue;

          const heatScore = computeHeatScore({
            value: p.value || 0,
            zip: p.zip || "",
            project_type: p.project_type || "other",
          });

          const heatTier = heatScore >= 80 ? "elite" : heatScore >= 60 ? "high" : heatScore >= 45 ? "medium" : "standard";

          const row = {
            permit_number: p.permit_no,
            description: p.desc || null,
            estimated_value: p.value || null,
            zip_code: p.zip || null,
            address: p.address || null,
            owner_name: p.owner_name || null,
            project_type: p.project_type || null,
            city: target.city,
            state: target.state,
            scraped_source: result.url || "firecrawl-search",
            scraped_at: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
            heat_score: heatScore,
            heat_tier: heatTier,
          };

          // Upsert by permit_number to avoid duplicates
          const { error: upsertErr } = await supabase
            .from("scraped_inventory")
            .upsert(row, { onConflict: "permit_number", ignoreDuplicates: true });

          if (upsertErr) {
            console.error("Upsert error:", upsertErr);
          } else {
            totalInserted++;
          }

          // If heat score > 85, log + trigger Telegram alert
          if (heatScore > 85) {
            await supabase.from("automated_logs").insert({
              event_type: "high_value_permit",
              channel: "system",
              status: "flagged",
              subject: `🔥 High-value permit: ${p.permit_no}`,
              recipient: null,
              metadata: {
                permit_number: p.permit_no,
                estimated_value: p.value,
                zip_code: p.zip,
                city: target.city,
                heat_score: heatScore,
              },
            });

            // Chain telegram-notify for elite permits
            try {
              const notifyUrl = `${supabaseUrl}/functions/v1/telegram-notify`;
              await fetch(notifyUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  permit: {
                    permit_number: p.permit_no,
                    description: p.desc,
                    estimated_value: p.value,
                    zip_code: p.zip,
                    city: target.city,
                    state: target.state,
                    project_type: p.project_type,
                  },
                }),
              });
            } catch (notifyErr) {
              console.error("Telegram notify chain failed:", notifyErr);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted: totalInserted, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Permit scraper error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
