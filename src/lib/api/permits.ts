import { supabase } from "@/integrations/supabase/client";

export const permitsApi = {
  async triggerScrape(targets?: { query: string; city: string; state: string }[]) {
    const { data, error } = await supabase.functions.invoke("permit-scraper", {
      body: targets ? { targets } : {},
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};

// Heat score calculation — used as fallback when DB heat_score is null
export function computeHeatScore(permit: {
  estimated_value: number | null;
  zip_code: string | null;
  project_type: string | null;
  // From DB (migration 20260326000001)
  heat_score?: number | null;
  heat_tier?: string | null;
}): { score: number; label: string; tier: "elite" | "high" | "medium" | "standard" } {
  // Prefer persisted score from DB
  if (permit.heat_score != null) {
    const tier = (permit.heat_tier as "elite" | "high" | "medium" | "standard") ?? "standard";
    const label =
      tier === "elite" ? "🔥 Elite Lead" :
      tier === "high"  ? "💎 High Value" :
      tier === "medium"? "⚡ Opportunity" : "Standard";
    return { score: permit.heat_score, label, tier };
  }

  // Fallback: compute client-side
  let score = 40;

  const val = permit.estimated_value ?? 0;
  if (val >= 250_000) score += 40;
  else if (val >= 100_000) score += 30;
  else if (val >= 50_000) score += 20;
  else if (val > 0) score += 10;

  const eliteZips = ["90210", "33139", "78701", "33109", "78703", "77005", "85253", "92037"];
  if (permit.zip_code && eliteZips.includes(permit.zip_code)) score += 15;

  const hotTypes = ["solar", "hvac", "roofing", "remodel"];
  if (permit.project_type && hotTypes.includes(permit.project_type.toLowerCase())) score += 5;

  score = Math.min(score, 100);

  let label: string;
  let tier: "elite" | "high" | "medium" | "standard";

  if (score >= 80)      { label = "🔥 Elite Lead";  tier = "elite";    }
  else if (score >= 60) { label = "💎 High Value";  tier = "high";     }
  else if (score >= 45) { label = "⚡ Opportunity"; tier = "medium";   }
  else                  { label = "Standard";        tier = "standard"; }

  return { score, label, tier };
}
