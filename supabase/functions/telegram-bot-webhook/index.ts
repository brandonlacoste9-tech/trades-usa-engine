import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;

const SYSTEM_PROMPT = `You are the Trades-USA Market Intelligence Bot. 
Your goal is to help trade contractors (HVAC, Roofing, Plumbing, etc.) understand their market and new lead opportunities.
You have access to permit data and market trends.
Keep responses concise, professional, and focused on helping the contractor get more work.
If you don't know something, be honest.
Format your responses with Telegram HTML markup (e.g. <b>bold</b>, <i>italic</i>).`;

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    
    // Check if it's a message
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text.trim();
      const codeMatch = text.toUpperCase().match(/[A-Z0-9]{6}/);
      
      // 1. Check for Verification Code (TC-XXXXXX or just 6 chars)
      if (codeMatch) {
        const code = codeMatch[0];
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_id, company_name")
          .eq("telegram_verification_code", code)
          .single();

        if (profile && !error) {
          await supabase
            .from("profiles")
            .update({
              telegram_chat_id: chatId,
              telegram_verification_code: null,
            })
            .eq("user_id", profile.user_id);

          await sendTelegramMessage(chatId, `✅ <b>Success!</b> Your account (${profile.company_name || "Contractor"}) is now linked to Trades-USA.\nYou will receive real-time lead alerts here moving forward.`);
          return new Response("OK", { status: 200 });
        }
      }

      // 2. Handle as AI Query
      console.log(`Processing AI query from ${chatId}: ${text}`);
      
      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text }
          ],
          max_tokens: 500,
        }),
      });

      const aiData = await aiResponse.json();
      const answer = aiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";

      await sendTelegramMessage(chatId, answer);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});

async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });
  return res.json();
}
