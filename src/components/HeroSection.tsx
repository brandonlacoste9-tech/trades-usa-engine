import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

import { brand } from "@/lib/brandConfig";

const stats = [
  { value: brand.ID === "USA" ? "330M+" : "40M+", label: `${brand.country} Population Served` },
  { value: brand.ID === "USA" ? "50" : "10", label: brand.ID === "USA" ? "States Covered" : "Provinces Covered" },
  { value: "3.2x", label: "Avg ROI Increase" },
  { value: "<5min", label: "Lead Response Time" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
      </div>

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Zap size={14} />
            Agency-as-a-Service for Trade Contractors
          </motion.div>

          <h1 className="font-display text-5xl font-black leading-tight tracking-tight md:text-7xl lg:text-8xl">
            We Build the Engine.
            <br />
            <span className="text-gradient-primary">You Get the Leads.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stop losing revenue to competitors who show up first on Google.
            Our AI-powered platform delivers exclusive, qualified homeowner leads
            directly to your phone — across all 50 states.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2 px-8 text-base"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Getting Leads
              <ArrowRight size={18} />
            </Button>
            <Button 
              variant="hero-outline" 
              size="lg" 
              className="gap-2 px-8 text-base"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-primary" />
              You Own Your Leads
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-primary" />
              No Per-Lead Fees
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-primary" />
              Flat Monthly Pricing
            </span>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 w-full max-w-3xl rounded-xl border border-border/50 bg-card/80 p-6 shadow-card backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-gradient-primary md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
