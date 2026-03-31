import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { permit } = body;

    // Look up Empire Builder users with a telegram_chat_id
    const { data: empireProfiles, error: profileErr } = await supabase
      .from("profiles")
      .select("telegram_chat_id, telegram_bot_token, subscription_plan")
      .eq("subscription_plan", "empire_builder")
      .not("telegram_chat_id", "is", null);

    if (profileErr) {
      console.error("Failed to fetch Empire profiles:", profileErr);
      return new Response(
        JSON.stringify({ success: false, error: profileErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatIds = (empireProfiles ?? [])
      .map((p: any) => p.telegram_chat_id)
      .filter(Boolean);

    if (chatIds.length === 0) {
      console.log("No Empire Builder users with Telegram configured.");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No Empire Builder chat IDs configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const value = permit.estimated_value
      ? `$${Number(permit.estimated_value).toLocaleString()}`
      : "Unknown";

    const message = [
      "🔥 <b>ELITE LEAD DETECTED</b>",
      "",
      `📋 <b>${permit.description || permit.permit_number || "New Permit"}</b>`,
      `📍 ${permit.city || ""}, ${permit.state || ""} ${permit.zip_code || ""}`,
      `💰 Value: <b>${value}</b>`,
      `🏗️ Type: ${permit.project_type || "General"}`,
      "",
      "⚡ Log in to your Command Center to claim this lead.",
    ].join("\n");

    let sent = 0;
    const errors: string[] = [];

    for (const profile of empireProfiles || []) {
      const chatId = (profile as any).telegram_chat_id;
      if (!chatId) continue;

      const botToken = (profile as any).telegram_bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN")!;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error(`Telegram send failed for ${chatId}:`, data);
        errors.push(`${chatId}: ${data.description}`);
      } else {
        sent++;
      }
    }

    // Log the notification
    await supabase.from("automated_logs").insert({
      event_type: "telegram_alert",
      channel: "telegram",
      status: sent > 0 ? "sent" : "failed",
      subject: `Elite alert: ${permit.description || permit.permit_number}`,
      metadata: {
        permit_number: permit.permit_number,
        estimated_value: permit.estimated_value,
        sent_count: sent,
        target_count: chatIds.length,
        errors,
      },
    });

    return new Response(
      JSON.stringify({ success: true, sent, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Telegram notify error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
