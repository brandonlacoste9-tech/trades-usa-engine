import { motion } from "framer-motion";
import { Flame, CheckCircle2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const mockLeads = [
  { city: "Austin", state: "TX", type: "Solar Installation", value: "$45,000", time: "2m ago" },
  { city: "Miami", state: "FL", type: "Roofing Replacement", value: "$28,500", time: "5m ago" },
  { city: "Scottsdale", state: "AZ", type: "HVAC System", value: "$12,000", time: "8m ago" },
  { city: "Houston", state: "TX", type: "Kitchen Remodel", value: "$85,000", time: "12m ago" },
  { city: "Denver", state: "CO", type: "Electrical Panel", value: "$4,500", time: "15m ago" },
];

const LivePermitFeed = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockLeads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const lead = mockLeads[index];

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card flex items-center gap-4 rounded-2xl border-white/[0.08] bg-primary/[0.03] p-4 shadow-glow"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-glow">
        <Flame size={20} className="animate-pulse" />
      </div>
      <div className="flex-1 overflow-hidden text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Signal</span>
          <span className="text-[10px] font-mono font-medium text-muted-foreground">{lead.time}</span>
        </div>
        <p className="truncate font-display text-sm font-bold text-foreground">
          {lead.type}
        </p>
        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <MapPin size={10} /> {lead.city}, {lead.state}
          </span>
          <span className="flex items-center gap-1 font-bold text-green-500">
            <CheckCircle2 size={10} /> Verified
          </span>
          <span className="ml-auto font-mono text-primary">{lead.value}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LivePermitFeed;
