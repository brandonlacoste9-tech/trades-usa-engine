import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe";
import { toast } from "sonner";

const plans = [
  {
    ...STRIPE_TIERS.professional,
    description: "Everything you need to start capturing exclusive leads in your market.",
    features: [
      "Lead Radar dashboard",
      "Permit Intelligence access",
      "AI lead scoring",
      "Instant SMS & email alerts",
      "ZIP code lead filtering",
      "Up to 50 leads / month",
    ],
    popular: false,
    elite: false,
  },
  {
    ...STRIPE_TIERS.dominator,
    description: "Full market dominance with unlimited leads and advanced AI scoring.",
    features: [
      "Everything in Starter",
      "Unlimited lead claims",
      "Multi-city market coverage",
      "Advanced AI heat scoring",
      "Telegram instant alerts",
      "Priority lead delivery",
      "Monthly strategy sessions",
    ],
    popular: true,
    elite: false,
  },
  {
    ...STRIPE_TIERS.empire,
    description: "Exclusive ZIP code authority for contractors targeting luxury & high-value projects.",
    features: [
      "Everything in Dominator",
      "Luxury ZIP code targeting (90210, 33139, etc.)",
      "Exclusive $250k+ elite permits",
      "First-to-claim priority queue",
      "Dedicated account strategist",
      "Custom trade & project filters",
      "API access & integrations",
    ],
    popular: false,
    elite: true,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info("Sign in to complete your subscription");
        // Store intent to subscribe to this plan after login/signup
        localStorage.setItem("pending_price_id", priceId);
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start checkout";
      toast.error(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Flat Monthly Pricing.
            <br />
            <span className="text-gradient-primary">No Per-Lead Fees.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Unlike Angi or HomeAdvisor, you pay one flat rate — exclusive leads,
            no bidding wars, no shared contacts.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isLoading = loadingPlan === plan.name;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-xl border p-8 shadow-card ${
                  plan.elite
                    ? "border-primary/60 bg-gradient-card shadow-glow ring-1 ring-primary/20"
                    : plan.popular
                    ? "border-primary/40 bg-gradient-card shadow-glow"
                    : "border-border/50 bg-gradient-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    <Star size={12} /> Most Popular
                  </div>
                )}
                {plan.elite && (
                  <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    <Crown size={12} /> Premium
                  </div>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="font-display text-5xl font-black text-gradient-primary">
                    ${plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-secondary-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular || plan.elite ? "hero" : "hero-outline"}
                  className="mt-8 w-full"
                  disabled={isLoading}
                  onClick={() => handleSubscribe(plan.price_id, plan.name)}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : plan.elite ? (
                    "Contact Sales"
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
