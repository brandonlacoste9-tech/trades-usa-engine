import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Radar,
  CalendarClock,
  TrendingUp,
  Users,
  Building2,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Bell,
} from "lucide-react";
import logo from "@/assets/logo.png";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [zipFilter, setZipFilter] = useState("");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Tables<"leads">[];
    },
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .limit(10);
      return (data ?? []) as Tables<"appointments">[];
    },
  });

  const { data: permits = [] } = useQuery({
    queryKey: ["permits", zipFilter],
    queryFn: async () => {
      let query = supabase
        .from("scraped_inventory")
        .select("*")
        .order("scraped_at", { ascending: false })
        .limit(10);
      if (zipFilter) query = query.eq("zip_code", zipFilter);
      const { data } = await query;
      return (data ?? []) as Tables<"scraped_inventory">[];
    },
  });

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

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : "0";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertCircle size={14} className="text-primary" />;
      case "contacted": return <Clock size={14} className="text-warning" />;
      case "converted": return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Clock size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-7 w-7" />
            <span className="font-display text-lg font-bold">
              COMMAND <span className="text-gradient-primary">CENTER</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: "Total Leads", value: totalLeads, color: "text-primary" },
            { icon: Radar, label: "New Today", value: newLeads, color: "text-primary" },
            { icon: CalendarClock, label: "Appointments", value: appointments.length, color: "text-primary" },
            { icon: TrendingUp, label: "Conversion Rate", value: `${conversionRate}%`, color: "text-green-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border/50 bg-gradient-card p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Leads */}
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Radar size={18} className="text-primary" /> Lead Radar
            </h2>
            {leads.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No leads yet. Share your website to start capturing leads.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {leads.slice(0, 8).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(lead.status)}
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.zip_code || "—"}{" "}
                          · {lead.trade || lead.project_type || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                        {lead.status}
                      </span>
                      {lead.score ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">Score: {lead.score}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Market Intelligence */}
            <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Building2 size={18} className="text-primary" /> Market Intel
              </h2>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="ZIP Code"
                    value={zipFilter}
                    onChange={(e) => setZipFilter(e.target.value)}
                    className="h-9 border-border/50 bg-background/50 pl-9 text-sm"
                    maxLength={5}
                  />
                </div>
              </div>
              {permits.length === 0 ? (
                <p className="mt-4 text-center text-xs text-muted-foreground">No permits found.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {permits.map((p) => (
                    <div key={p.id} className="rounded-lg border border-border/30 bg-background/30 p-3">
                      <p className="text-xs font-medium">{p.description || p.permit_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.city}, {p.state} {p.zip_code}
                        {p.estimated_value ? ` · $${Number(p.estimated_value).toLocaleString()}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Automation Log */}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
