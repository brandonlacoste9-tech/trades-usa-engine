import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { brand } from "@/lib/brandConfig";
import LivePermitFeed from "./LivePermitFeed";

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
          className="h-full w-full object-cover object-center opacity-60 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        {/* Animated Radial Orbs */}
        <div className="absolute -left-[10%] top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] top-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-6 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-glow"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live in {brand.country}: Exclusive Lead Generation
          </motion.div>

          <h1 className="font-display text-6xl font-black leading-[1.1] tracking-tight md:text-8xl lg:text-9xl">
            Stop Chasing.
            <br />
            <span className="text-gradient-primary">Start Closing.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            AI-powered permit intelligence and lead scoring that puts exclusive,
            qualified project leads directly in your hands — before your
            competitors even know they exist in <span className="text-foreground font-bold">{brand.country}</span>.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="group h-14 gap-2 px-10 text-lg shadow-glow"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Getting Leads
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="lg" 
              className="h-14 gap-2 px-10 text-lg backdrop-blur-md"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              100% Leads Ownership
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Zero Per-Lead Fees
            </span>
            <span className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              Immediate Response Time
            </span>
          </div>
        </motion.div>

        {/* Floating "Live Signal" Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-12 right-8 hidden lg:block"
        >
          <div className="max-w-[300px]">
            <LivePermitFeed />
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-card/60 p-8 shadow-card backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="font-display text-3xl font-black text-gradient-primary md:text-4xl transition-transform group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
