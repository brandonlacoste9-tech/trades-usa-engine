import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Search, Loader2, Flame, Gem, Zap, Lock } from "lucide-react";
import { computeHeatScore } from "@/lib/api/permits";
import { permitsApi } from "@/lib/api/permits";
import { canViewElitePermits } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface MarketIntelCardProps {
  zipFilter: string;
  setZipFilter: (v: string) => void;
  subscriptionPlan: string | null | undefined;
}

const tierBadge = (tier: string) => {
  switch (tier) {
    case "elite":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
          <Flame size={10} /> ELITE
        </span>
      );
    case "high":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
          <Gem size={10} /> HIGH VALUE
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
          <Zap size={10} /> OPPORTUNITY
        </span>
      );
    default:
      return null;
  }
};

const MarketIntelCard = ({ zipFilter, setZipFilter, subscriptionPlan }: MarketIntelCardProps) => {
  const queryClient = useQueryClient();
  const [isScraping, setIsScraping] = useState(false);
  const showElite = canViewElitePermits(subscriptionPlan);

  const { data: permits = [] } = useQuery({
    queryKey: ["permits", zipFilter],
    queryFn: async () => {
      let query = supabase
        .from("scraped_inventory")
        .select("*")
        .order("scraped_at", { ascending: false })
        .limit(15);
      if (zipFilter) query = query.eq("zip_code", zipFilter);
      const { data } = await query;
      return (data ?? []) as Tables<"scraped_inventory">[];
    },
  });

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const result = await permitsApi.triggerScrape();
      if (result.success) {
        toast.success(`Scraped ${result.inserted} permits`);
        queryClient.invalidateQueries({ queryKey: ["permits"] });
        queryClient.invalidateQueries({ queryKey: ["automation-logs"] });
      } else {
        toast.error(result.error || "Scrape failed");
      }
    } catch {
      toast.error("Failed to trigger scraper");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Building2 size={18} className="text-primary" /> Market Intel
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScrape}
          disabled={isScraping}
          className="h-7 gap-1.5 text-xs"
        >
          {isScraping ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
          {isScraping ? "Scanning..." : "Scan Permits"}
        </Button>
      </div>

      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Filter by ZIP"
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className="h-9 border-border/50 bg-background/50 pl-9 text-sm"
            maxLength={5}
          />
        </div>
      </div>

      {permits.length === 0 ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No permits found. Click "Scan Permits" to fetch live data.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {permits.map((p) => {
            const heat = computeHeatScore({
              estimated_value: p.estimated_value ? Number(p.estimated_value) : null,
              zip_code: p.zip_code,
              project_type: p.project_type,
            });

            // Gate elite permits for non-Empire/Dominator users
            const isGated = heat.tier === "elite" && !showElite;

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-background/30 p-3 transition-colors ${
                  isGated
                    ? "border-border/20 opacity-60"
                    : heat.tier === "elite"
                    ? "border-destructive/30"
                    : heat.tier === "high"
                    ? "border-primary/30"
                    : "border-border/30"
                }`}
              >
                {isGated ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock size={12} />
                    <span>
                      High-value permit — <span className="font-medium text-primary">upgrade to Empire Builder</span> to
                      unlock
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium leading-tight">
                        {p.description || p.permit_number}
                      </p>
                      {tierBadge(heat.tier)}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {p.city}, {p.state} {p.zip_code}
                        {p.estimated_value
                          ? ` · $${Number(p.estimated_value).toLocaleString()}`
                          : ""}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Score: {heat.score}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketIntelCard;
