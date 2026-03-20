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

// Heat score calculation (mirrors edge function logic for display)
export function computeHeatScore(permit: {
  estimated_value: number | null;
  zip_code: string | null;
  project_type: string | null;
}): { score: number; label: string; tier: "elite" | "high" | "medium" | "standard" } {
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

  if (score >= 80) { label = "🔥 Elite Lead"; tier = "elite"; }
  else if (score >= 60) { label = "💎 High Value"; tier = "high"; }
  else if (score >= 45) { label = "⚡ Opportunity"; tier = "medium"; }
  else { label = "Standard"; tier = "standard"; }

  return { score, label, tier };
}
