import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  Loader2,
  Flame,
  Gem,
  Zap,
  Lock,
  CheckCircle2,
  Flag,
} from "lucide-react";
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
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const showElite = canViewElitePermits(subscriptionPlan);

  const { data: permits = [] } = useQuery({
    queryKey: ["permits", zipFilter],
    queryFn: async () => {
      let query = supabase
        .from("scraped_inventory")
        .select("*")
        .order("created_at", { ascending: false })
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

  const handleClaim = async (permit: Tables<"scraped_inventory">) => {
    setClaimingId(permit.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); return; }

      // 1. Mark permit as claimed
      const { error: claimErr } = await supabase
        .from("scraped_inventory")
        .update({
          is_claimed: true,
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        } as any)
        .eq("id", permit.id);

      if (claimErr) { toast.error("Failed to claim — may already be taken"); return; }

      // 2. Copy to leads table
      const { error: leadErr } = await supabase.from("leads").insert({
        name: permit.owner_name || permit.description || "Permit Lead",
        contractor_id: user.id,
        project_type: permit.project_type || "permit",
        city: permit.city,
        state: permit.state,
        zip_code: permit.zip_code,
        notes: `Permit #${permit.permit_number}. Value: $${Number(permit.estimated_value || 0).toLocaleString()}. Address: ${permit.address || "N/A"}`,
        source: "permit_claim",
        status: "new",
      });

      if (leadErr) { toast.error("Claimed but failed to create lead"); return; }

      toast.success("Project claimed and added to your leads!");
      queryClient.invalidateQueries({ queryKey: ["permits"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch {
      toast.error("Claim failed");
    } finally {
      setClaimingId(null);
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

            const isGated = heat.tier === "elite" && !showElite;
            const isClaimed = (p as any).is_claimed === true;
            const isClaimingThis = claimingId === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-background/30 p-3 transition-colors ${
                  isClaimed
                    ? "border-border/20 opacity-50"
                    : isGated
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
                      High-value permit —{" "}
                      <span className="font-medium text-primary">upgrade to Empire Builder</span> to unlock
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium leading-tight flex-1">
                        {p.description || p.permit_number}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tierBadge(heat.tier)}
                        {isClaimed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-500">
                            <CheckCircle2 size={10} /> CLAIMED
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClaim(p)}
                            disabled={isClaimingThis}
                            className="h-6 gap-1 px-2 text-[10px] font-bold text-primary hover:bg-primary/10"
                          >
                            {isClaimingThis ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Flag size={10} />
                            )}
                            Claim
                          </Button>
                        )}
                      </div>
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
