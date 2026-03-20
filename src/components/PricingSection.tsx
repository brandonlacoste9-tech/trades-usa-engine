import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown } from "lucide-react";

const plans = [
  {
    name: "The Web Starter",
    price: 149,
    description: "Get online and start building your digital foundation.",
    features: [
      "Custom responsive website",
      "Basic SEO optimization",
      "Mobile-first design",
      "Contact form integration",
      "Google Business Profile setup",
    ],
    popular: false,
    elite: false,
  },
  {
    name: "The Lead Engine",
    price: 349,
    description: "Turn your website into a lead-generating machine.",
    features: [
      "Everything in Web Starter",
      "Lead capture automation",
      "Planexa scheduling engine",
      "Automated email follow-ups",
      "Monthly SEO optimization",
      "Contractor dashboard access",
    ],
    popular: true,
    elite: false,
  },
  {
    name: "The Market Dominator",
    price: 599,
    description: "Dominate your local market with full automation.",
    features: [
      "Everything in Lead Engine",
      "Market intelligence feed",
      "AI lead scoring",
      "Multi-channel automation (Email + SMS)",
      "Priority support",
      "Quarterly strategy sessions",
    ],
    popular: false,
    elite: false,
  },
  {
    name: "The Empire Builder",
    price: 999,
    description: "For contractors targeting luxury markets and high-value ZIP codes.",
    features: [
      "Everything in Market Dominator",
      "Luxury ZIP code targeting (90210, 33139, etc.)",
      "Premium lead scoring with property values",
      "Dedicated account strategist",
      "White-glove onboarding",
      "Custom integrations & API access",
      "Weekly strategy calls",
    ],
    popular: false,
    elite: true,
  },
];

const PricingSection = () => {
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
            Unlike Angi or HomeAdvisor, you pay one flat rate — no surprises, no
            shared leads, no bidding wars.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
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
                  ${plan.price}
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
              >
                {plan.elite ? "Contact Sales" : "Get Started"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
