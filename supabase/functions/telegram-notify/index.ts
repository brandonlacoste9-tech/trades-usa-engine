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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { permit, chat_ids } = body;

    // If chat_ids provided, send to those. Otherwise, look up Empire Builder users' telegram IDs.
    let targetChatIds: string[] = chat_ids ?? [];

    if (targetChatIds.length === 0) {
      // Fetch Empire Builder profiles that have a phone (used as telegram chat_id placeholder)
      // In production, you'd store telegram_chat_id on the profile
      console.log("No explicit chat_ids provided, skipping Telegram send.");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No chat_ids configured" }),
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
      "⚡ Log in to your Command Center to claim this lead before someone else does.",
    ].join("\n");

    let sent = 0;
    const errors: string[] = [];

    for (const chatId of targetChatIds) {
      const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TELEGRAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`Telegram send failed for ${chatId}:`, data);
        errors.push(`${chatId}: ${JSON.stringify(data)}`);
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
