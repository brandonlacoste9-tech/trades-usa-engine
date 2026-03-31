import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import VideoMockup from "./VideoMockup";

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-black/40 backdrop-blur-sm border-y border-white/[0.04]">
      <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
      
      <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
          <div className="mb-4 mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">Demo</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-4">See How It Works</h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Watch a quick walkthrough of the Trades USA lead generation engine.
          </p>

          <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
            {/* Video Thumbnail Placeholder */}
            <div 
              className="aspect-video rounded-3xl overflow-hidden border border-white/[0.1] bg-black/60 relative shadow-2xl group-hover:scale-[1.01] transition-transform duration-500 bg-cover bg-center"
              style={{ backgroundImage: 'url("/video-thumbnail.png")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-primary/20 group-hover:opacity-40 transition-opacity" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Play size={40} className="fill-current ml-1" />
                </div>
                <span className="text-white font-bold tracking-widest uppercase text-sm drop-shadow-md">Watch Demo</span>
              </div>

              {/* Fake UI Elements for "Demo" feel */}
               <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Platform Preview</span>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-all" />
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-infinite border border-white/[0.08] bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X size={20} />
              </button>

              {/* The Dynamic Animated Walkthrough */}
              <VideoMockup />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
