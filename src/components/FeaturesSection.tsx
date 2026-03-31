import { motion } from "framer-motion";
import {
  Radar,
  MapPin,
  Smartphone,
  BarChart3,
  Zap,
  Search,
} from "lucide-react";

const features = [
  {
    icon: Radar,
    title: "Lead Radar",
    description:
      "Real-time lead tracking and AI-powered scoring. Know exactly which homeowners need your trade services before your competitors do.",
  },
  {
    icon: Search,
    title: "Permit Intelligence",
    description:
      "Scraped building permit data from county and city portals — delivered as actionable, ready-to-claim leads directly in your dashboard.",
  },
  {
    icon: Zap,
    title: "AI Lead Scoring",
    description:
      "Every lead is automatically scored by project value, urgency, and ZIP code demand so you focus on the jobs worth chasing.",
  },
  {
    icon: BarChart3,
    title: "Market Intelligence",
    description:
      "See exactly where demand is surging in your area. Track permit activity, project types, and competitor gaps across every ZIP code.",
  },
  {
    icon: Smartphone,
    title: "Instant Lead Alerts",
    description:
      "Get new lead alerts via SMS, email, and Telegram the second a homeowner submits a request. Speed to lead wins the job.",
  },
  {
    icon: MapPin,
    title: "Hyper-Local Targeting",
    description:
      "Filter and claim leads by ZIP code, city, or trade type. Own your market — no bidding against other contractors for the same lead.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Your Exclusive
            <br />
            <span className="text-gradient-primary">Lead Generation Engine</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to find, score, and claim qualified leads — built
            exclusively for trade contractors.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-glow"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon size={24} />
              </div>
              <h3 className="font-display text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
