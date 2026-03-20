import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const LeadCaptureSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const email = (form.get("email") as string).trim();
    const phone = (form.get("phone") as string).trim();
    const trade = tradeMap[form.get("trade") as string] || "other";
    const location = (form.get("location") as string).trim();

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone,
      trade: trade as any,
      city: location,
      source: "website",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
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
              <h3 className="mt-4 font-display text-2xl font-bold">
                You're In!
              </h3>
              <p className="mt-2 text-muted-foreground">
                Our team will reach out within 24 hours to get your lead engine
                started.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  Ready to
                  <span className="text-gradient-primary"> Dominate?</span>
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Fill out the form and we'll show you exactly how many leads you're
                  missing in your market.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="name" placeholder="Full Name" required className="border-border/50 bg-background/50" />
                  <Input name="company" placeholder="Company Name" className="border-border/50 bg-background/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="email" type="email" placeholder="Email" required className="border-border/50 bg-background/50" />
                  <Input name="phone" type="tel" placeholder="Phone" required className="border-border/50 bg-background/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    name="trade"
                    required
                    className="h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm text-foreground"
                  >
                    <option value="">Select Your Trade</option>
                    {trades.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Input name="location" placeholder="City, State" required className="border-border/50 bg-background/50" />
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
