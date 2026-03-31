import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Valid trade values matching the trade_type enum in DB
const trades = [
  "General Contracting",
  "HVAC",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Solar Installation",
  "Landscaping",
  "Renovations",
  "Other",
];

const tradeMap: Record<string, string> = {
  "General Contracting": "general_contracting",
  "HVAC": "hvac",
  "Roofing": "roofing",
  "Plumbing": "plumbing",
  "Electrical": "electrical",
  "Solar Installation": "solar",
  "Landscaping": "landscaping",
  "Renovations": "renovations",
  "Other": "other",
};

// In-memory rate limit: max 3 submissions per 10 min per session
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 1200;

let _submitCount = 0;
let _windowStart = Date.now();

function isRateLimited(): boolean {
  const now = Date.now();
  if (now - _windowStart > RATE_LIMIT_WINDOW_MS) {
    _submitCount = 0;
    _windowStart = now;
  }
  if (_submitCount >= RATE_LIMIT_MAX) return true;
  _submitCount++;
  return false;
}

const LeadCaptureSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const { toast } = useToast();
  const formRenderedAt = useRef(Date.now());

  useEffect(() => {
    formRenderedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot check — bots fill hidden fields
    if (website.trim().length > 0) {
      setSubmitted(true); // silent fake success
      return;
    }

    // Fill-time gate — too fast = bot
    if (Date.now() - formRenderedAt.current < MIN_FILL_MS) {
      setSubmitted(true);
      return;
    }

    // Client-side rate limit
    if (isRateLimited()) {
      toast({
        title: "Too many submissions",
        description: "Please wait a few minutes and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const email = (form.get("email") as string).trim();
    const phone = (form.get("phone") as string).trim();
    const trade = tradeMap[form.get("trade") as string] || "other";
    const location = (form.get("location") as string).trim();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          trade,
          city: location || null,
          source: "website",
          form_rendered_at: formRenderedAt.current,
        }),
      }).catch(() => null);

      // If no server-side API, fall back to direct Supabase insert
      // (Vite SPA — no /api/leads route available)
      if (!res || res.status === 404) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { error } = await supabase.from("leads").insert({
          name,
          email,
          phone: phone || null,
          trade: trade as any,
          city: location || null,
          source: "website",
        });
        if (error) throw new Error(error.message);
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl rounded-xl border border-primary/20 bg-gradient-card p-8 shadow-glow md:p-12"
        >
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto text-primary" />
              <h3 className="mt-4 font-display text-2xl font-bold">You're In!</h3>
              <p className="mt-2 text-muted-foreground">
                We'll send your market report within 24 hours — showing live permit activity and open leads in your area.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  See Your
                  <span className="text-gradient-primary"> Free Market Report</span>
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Enter your trade and location — we'll pull live permit data and show
                  exactly how many exclusive leads are available in your market right now.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="name" placeholder="Full Name *" required className="border-border/50 bg-background/50" />
                  <Input name="company" placeholder="Company Name" className="border-border/50 bg-background/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="email" type="email" placeholder="Email *" required className="border-border/50 bg-background/50" />
                  <Input name="phone" type="tel" placeholder="Phone *" required className="border-border/50 bg-background/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    name="trade"
                    required
                    className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm text-foreground"
                  >
                    <option value="">Select Your Trade *</option>
                    {trades.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Input name="location" placeholder="City, State *" required className="border-border/50 bg-background/50" />
                </div>
                <Button variant="hero" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading ? "Submitting..." : "Get My Free Market Report"}
                  {!loading && <ArrowRight size={18} />}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No contracts. No per-lead fees. Cancel anytime.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
