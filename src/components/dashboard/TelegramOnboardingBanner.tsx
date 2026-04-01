import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowRight, X, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { brand } from "@/lib/brandConfig";

interface Props {
  isConnected: boolean;
}

export default function TelegramOnboardingBanner({ isConnected }: Props) {
  const [dismissed, setDismissed] = React.useState(false);

  if (isConnected || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative group mb-8"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative glass-card bg-primary/[0.03] border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-2xl">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center relative">
            <MessageCircle className="w-7 h-7 text-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h3 className="text-lg font-display font-bold text-foreground">
                Get Instant {brand.adjective} Lead Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase tracking-widest font-black border border-primary/30">
                New
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl">
              Connect your Telegram bot to receive new construction leads the second they arrive in {brand.country}. Never miss an opportunity to bid on a project again.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => {
                const el = document.getElementById('settings');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
                  setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background'), 2000);
                }
              }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 flex-1 md:flex-none"
            >
              Setup Telegram
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button 
              onClick={() => setDismissed(true)}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
