import { motion } from "framer-motion";
import { MapPin, TrendingUp, Building2 } from "lucide-react";

const cities = [
  { city: "New York", state: "NY", permits: "120,000+", growth: "8%", trades: "GC, Plumbing, Electrical" },
  { city: "Los Angeles", state: "CA", permits: "85,000+", growth: "11%", trades: "Roofing, Solar, HVAC" },
  { city: "Chicago", state: "IL", permits: "55,000+", growth: "7%", trades: "HVAC, Plumbing, Electrical" },
  { city: "Houston", state: "TX", permits: "65,000+", growth: "16%", trades: "HVAC, Plumbing, Solar" },
  { city: "Phoenix", state: "AZ", permits: "50,000+", growth: "18%", trades: "HVAC, Roofing, Solar" },
  { city: "Dallas", state: "TX", permits: "48,000+", growth: "15%", trades: "HVAC, Roofing, GC" },
  { city: "Miami", state: "FL", permits: "42,000+", growth: "13%", trades: "Roofing, HVAC, Plumbing" },
  { city: "Atlanta", state: "GA", permits: "38,000+", growth: "14%", trades: "HVAC, Roofing, Landscaping" },
  { city: "Philadelphia", state: "PA", permits: "35,000+", growth: "6%", trades: "Renovations, Plumbing" },
  { city: "Seattle", state: "WA", permits: "30,000+", growth: "10%", trades: "Roofing, Plumbing, HVAC" },
];

const MarketsSection = () => {
  return (
    <section id="markets" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Markets
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Dominate Your
            <span className="text-gradient-primary"> Local Market</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're launching in the 10 highest-growth construction markets in America.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cities.map((c, i) => (
            <motion.div
              key={c.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-lg border border-border/50 bg-gradient-card p-4 transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span className="font-display text-sm font-bold">
                  {c.city}, {c.state}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 size={10} /> Permits
                  </span>
                  <span className="font-medium text-foreground">{c.permits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={10} /> Growth
                  </span>
                  <span className="font-medium text-primary">{c.growth}</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">{c.trades}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;
