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

    const { contractor_id, client_name, service, date, time } = await req.json();

    if (!contractor_id) {
      return new Response(
        JSON.stringify({ success: false, error: "contractor_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up contractor's telegram_chat_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_chat_id, company_name")
      .eq("user_id", contractor_id)
      .single();

    const chatId = (profile as any)?.telegram_chat_id;
    if (!chatId) {
      console.log("Contractor has no Telegram chat ID configured");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No chat ID configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = [
      "📅 <b>NEW APPOINTMENT BOOKED</b>",
      "",
      `👤 Client: <b>${client_name || "Unknown"}</b>`,
      `🔧 Service: ${service || "General"}`,
      `📆 Date: <b>${date || "TBD"}</b>`,
      `🕐 Time: <b>${time || "TBD"}</b>`,
      "",
      "⚡ Open your Command Center to review details.",
    ].join("\n");

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
      console.error("Telegram booking alert failed:", data);
      return new Response(
        JSON.stringify({ success: false, error: `Telegram API failed [${response.status}]` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the event
    await supabase.from("automated_logs").insert({
      event_type: "booking_alert",
      channel: "telegram",
      status: "sent",
      contractor_id,
      subject: `New booking: ${client_name} for ${service}`,
      recipient: chatId,
    });

    return new Response(
      JSON.stringify({ success: true, sent: 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Booking alert error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
