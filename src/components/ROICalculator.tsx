import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STRIPE_TIERS } from "@/lib/stripe";
import { brand } from "@/lib/brandConfig";

const ROICalculator = () => {
  const [leadsPerMonth, setLeadsPerMonth] = useState(20);
  const [avgJobValue, setAvgJobValue] = useState(5000);
  const [closeRate, setCloseRate] = useState(25);

  const monthlyRevenue = leadsPerMonth * (closeRate / 100) * avgJobValue;
  const annualRevenue = monthlyRevenue * 12;
  const investmentCost = STRIPE_TIERS.professional.price * 12; // Lead Engine plan
  const roi = ((annualRevenue - investmentCost) / investmentCost) * 100;

  return (
    <section id="roi" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            ROI Calculator
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            See Your
            <span className="text-gradient-primary"> Revenue Potential</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-4xl rounded-xl border border-border/50 bg-gradient-card p-8 shadow-card"
        >
          <div className="grid gap-10 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-8">
              <div>
                <label className="flex items-center justify-between text-sm font-medium">
                  <span>Leads per month</span>
                  <span className="font-display text-lg font-bold text-primary">{leadsPerMonth}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={leadsPerMonth}
                  onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-medium">
                  <span>Average job value</span>
                  <span className="font-display text-lg font-bold text-primary">
                    ${avgJobValue.toLocaleString()}
                  </span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={avgJobValue}
                  onChange={(e) => setAvgJobValue(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-medium">
                  <span>Close rate</span>
                  <span className="font-display text-lg font-bold text-primary">{closeRate}%</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={80}
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign size={16} className="text-primary" />
                  Estimated Monthly Revenue
                </div>
                <div className="mt-1 font-display text-3xl font-black text-gradient-primary">
                  ${monthlyRevenue.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator size={16} className="text-primary" />
                  Estimated Annual Revenue
                </div>
                <div className="mt-1 font-display text-3xl font-black text-foreground">
                  ${annualRevenue.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp size={16} className="text-primary" />
                  Estimated ROI
                </div>
                <div className="mt-1 font-display text-3xl font-black text-gradient-primary">
                  {roi.toFixed(0)}%
                </div>
              </div>
              <Button variant="hero" className="w-full">
                Start Getting These Results
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ROICalculator;
