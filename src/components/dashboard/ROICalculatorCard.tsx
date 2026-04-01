import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

const ROICalculatorCard = () => {
  const { data: permits = [] } = useQuery({
    queryKey: ["roi-permits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scraped_inventory")
        .select("estimated_value, is_claimed, claimed_by")
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as any[];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["roi-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, source, status")
        .eq("source", "permit_claim");
      return (data ?? []) as Tables<"leads">[];
    },
  });

  const totalPermitValue = permits.reduce(
    (sum, p) => sum + (Number(p.estimated_value) || 0),
    0
  );
  const claimedPermits = permits.filter((p) => p.is_claimed);
  const claimedValue = claimedPermits.reduce(
    (sum: number, p: any) => sum + (Number(p.estimated_value) || 0),
    0
  );
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  // Average contractor margin ~15-25% on project value
  const estimatedRevenue = claimedValue * 0.2;

  const stats = [
    {
      icon: Target,
      label: "Permits Scanned",
      value: permits.length.toString(),
      sub: "this period",
    },
    {
      icon: DollarSign,
      label: "Total Opportunity",
      value: `$${(totalPermitValue / 1_000_000).toFixed(1)}M`,
      sub: "pipeline value",
    },
    {
      icon: Zap,
      label: "You Claimed",
      value: claimedPermits.length.toString(),
      sub: `$${claimedValue.toLocaleString()} value`,
    },
    {
      icon: TrendingUp,
      label: "Est. Revenue",
      value: `$${estimatedRevenue >= 1000 ? `${(estimatedRevenue / 1000).toFixed(0)}k` : estimatedRevenue.toLocaleString()}`,
      sub: "at 20% margin",
    },
  ];

  const claimRate =
    permits.length > 0
      ? ((claimedPermits.length / permits.length) * 100).toFixed(0)
      : "0";

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <TrendingUp size={18} className="text-primary" /> ROI Calculator
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Your potential revenue from permits we've detected in your market.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border border-border/30 bg-background/30 p-3"
          >
            <div className="flex items-center gap-2">
              <stat.icon size={14} className="text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="mt-1 font-display text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Claim rate bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Claim Rate</span>
          <span className="font-mono font-bold text-primary">{claimRate}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${claimRate}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {Number(claimRate) < 30
            ? "💡 Tip: Claim more permits to maximize your ROI. Elite leads expire fast."
            : Number(claimRate) < 60
            ? "⚡ Good pace! You're capturing opportunities ahead of the competition."
            : "🔥 Excellent claim rate. You're dominating your market."}
        </p>
      </div>
    </div>
  );
};

export default ROICalculatorCard;
