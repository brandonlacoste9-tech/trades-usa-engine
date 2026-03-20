import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const AutomationLogCard = () => {
  const { data: logs = [] } = useQuery({
    queryKey: ["automation-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("automated_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as Tables<"automated_logs">[];
    },
  });

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Bell size={18} className="text-primary" /> Automation Log
      </h2>
      {logs.length === 0 ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">No automation events yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-xs">
              <Mail size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <span className="font-medium">{log.event_type}</span>
                <span className="text-muted-foreground"> · {log.channel} · {log.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationLogCard;
