import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import { CalendarClock, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

const AppointmentsCard = () => {
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(10);
      return (data ?? []) as Tables<"appointments">[];
    },
  });

  const dateLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isThisWeek(d)) return format(d, "EEEE");
    return format(d, "MMM d");
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <CalendarClock size={18} className="text-primary" /> Upcoming Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No upcoming appointments. Share your booking link to start scheduling.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/30 px-4 py-3"
            >
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-[10px] font-bold uppercase leading-none">
                  {dateLabel(apt.scheduled_date)}
                </span>
                <span className="text-xs font-mono font-bold">
                  {apt.scheduled_time?.slice(0, 5)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{apt.client_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {apt.notes || "No notes"}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                  apt.status === "confirmed"
                    ? "bg-green-500/15 text-green-500"
                    : apt.status === "cancelled"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {apt.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsCard;
