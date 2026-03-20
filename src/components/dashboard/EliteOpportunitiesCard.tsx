import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Flame, Crown } from "lucide-react";
import { computeHeatScore } from "@/lib/api/permits";
import type { Tables } from "@/integrations/supabase/types";

const EliteOpportunitiesCard = () => {
  const { data: elitePermits = [] } = useQuery({
    queryKey: ["elite-permits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scraped_inventory")
        .select("*")
        .eq("is_claimed", false)
        .order("estimated_value", { ascending: false })
        .limit(10);
      return (data ?? []) as Tables<"scraped_inventory">[];
    },
  });

  const topPermits = elitePermits.filter((p) => {
    const heat = computeHeatScore({
      estimated_value: p.estimated_value ? Number(p.estimated_value) : null,
      zip_code: p.zip_code,
      project_type: p.project_type,
    });
    return heat.score >= 70;
  });

  return (
    <div className="rounded-xl border border-destructive/20 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Crown size={18} className="text-destructive" />
        Elite Opportunities
        <span className="ml-auto rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
          EMPIRE EXCLUSIVE
        </span>
      </h2>

      {topPermits.length === 0 ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No elite opportunities right now. The scanner runs every 6 hours.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {topPermits.map((p) => {
            const heat = computeHeatScore({
              estimated_value: p.estimated_value ? Number(p.estimated_value) : null,
              zip_code: p.zip_code,
              project_type: p.project_type,
            });

            return (
              <div
                key={p.id}
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-destructive shrink-0" />
                    <p className="text-xs font-medium leading-tight">
                      {p.description || p.permit_number}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-destructive shrink-0">
                    {heat.score}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground pl-6">
                  {p.city}, {p.state} {p.zip_code}
                  {p.estimated_value
                    ? ` · $${Number(p.estimated_value).toLocaleString()}`
                    : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EliteOpportunitiesCard;
