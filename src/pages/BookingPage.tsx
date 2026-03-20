import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

const SERVICES = [
  "Roofing Estimate",
  "HVAC Inspection",
  "Plumbing Assessment",
  "Electrical Consultation",
  "Solar Installation Quote",
  "General Renovation",
  "Pool Service Estimate",
  "Landscaping Consultation",
  "Hurricane Protection",
  "Other",
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00",
];

const BookingPage = () => {
  const { contractorId } = useParams<{ contractorId: string }>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Fetch contractor profile
  const { data: contractor } = useQuery({
    queryKey: ["contractor-profile", contractorId],
    queryFn: async () => {
      if (!contractorId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", contractorId)
        .single();
      return data as Tables<"profiles"> | null;
    },
    enabled: !!contractorId,
  });

  // Fetch existing appointments for the selected date to show unavailable slots
  const { data: existingAppointments = [] } = useQuery({
    queryKey: ["booked-slots", contractorId, date ? format(date, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!contractorId || !date) return [];
      const { data } = await supabase
        .from("appointments")
        .select("scheduled_time")
        .eq("contractor_id", contractorId)
        .eq("scheduled_date", format(date, "yyyy-MM-dd"));
      return (data ?? []) as { scheduled_time: string }[];
    },
    enabled: !!contractorId && !!date,
  });

  const bookedTimes = existingAppointments.map((a) => a.scheduled_time?.slice(0, 5));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorId || !date || !time || !service || !name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        contractor_id: contractorId,
        client_name: name.trim(),
        client_email: email.trim() || null,
        client_phone: phone.trim() || null,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time,
        notes: `Service: ${service}${notes ? `. ${notes.trim()}` : ""}`,
        status: "scheduled",
      });

      if (error) {
        toast.error("Booking failed. Please try again.");
        return;
      }

      // Trigger Telegram notification to contractor
      try {
        await supabase.functions.invoke("telegram-booking-alert", {
          body: {
            contractor_id: contractorId,
            client_name: name.trim(),
            service,
            date: format(date, "PPP"),
            time,
          },
        });
      } catch {
        // Non-blocking — alert is bonus
      }

      setIsBooked(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Helmet>
          <title>Booking Confirmed | Trades USA</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border/50 bg-gradient-card p-8 text-center shadow-card"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Booking Confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your {service} has been scheduled for{" "}
            <span className="font-medium text-foreground">
              {date && format(date, "MMMM d, yyyy")}
            </span>{" "}
            at <span className="font-medium text-foreground">{time}</span>.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {contractor?.company_name || "Your contractor"} has been notified and will reach out to confirm.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Helmet>
        <title>
          Book an Estimate{contractor?.company_name ? ` with ${contractor.company_name}` : ""} | Trades USA
        </title>
        <meta
          name="description"
          content={`Schedule a free estimate${contractor?.company_name ? ` with ${contractor.company_name}` : ""}. Pick a date and time that works for you.`}
        />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl border border-border/50 bg-gradient-card p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarClock size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Book an Estimate</h1>
              {contractor?.company_name && (
                <p className="text-xs text-muted-foreground">with {contractor.company_name}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service */}
            <div>
              <label className="mb-1.5 block text-xs font-medium">Service *</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-medium">Date *</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date() || d.getDay() === 0}
                className={cn("rounded-lg border border-border/50 p-3 pointer-events-auto")}
              />
            </div>

            {/* Time */}
            {date && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="mb-1.5 block text-xs font-medium">Time *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedTimes.includes(slot);
                    const isSelected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setTime(slot)}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                          isBooked
                            ? "cursor-not-allowed border-border/20 bg-muted/30 text-muted-foreground line-through"
                            : isSelected
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        <Clock size={10} />
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Your Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  maxLength={100}
                  className="border-border/50 bg-background/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  maxLength={20}
                  className="border-border/50 bg-background/50"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                className="border-border/50 bg-background/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your project (optional)"
                maxLength={500}
                rows={3}
                className="border-border/50 bg-background/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !date || !time || !service || !name}
              className="w-full gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CalendarClock size={16} />
              )}
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingPage;
