import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  MessageCircle, 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  RefreshCw,
  ExternalLink,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { brand } from "@/lib/brandConfig";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSettingsCardProps {
  userId: string;
  telegramChatId: string | null;
  telegramBotToken?: string | null;
}

const ProfileSettingsCard = ({ userId, telegramChatId, telegramBotToken }: ProfileSettingsCardProps) => {
  const [chatId, setChatId] = useState(telegramChatId || "");
  const [botToken, setBotToken] = useState(telegramBotToken || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    setChatId(telegramChatId || "");
    setBotToken(telegramBotToken || "");
  }, [telegramChatId, telegramBotToken]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          telegram_chat_id: chatId || null,
          telegram_bot_token: botToken || null
        } as any)
        .eq("user_id", userId);

      if (error) {
        toast.error("Failed to save settings");
      } else {
        toast.success("Telegram settings saved");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const generateTelegramCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTelegramCode(code);
    setPolling(true);

    try {
      // Store code in profile table for bot verification
      await supabase
        .from("profiles")
        .update({ 
          telegram_verification_code: code,
          updated_at: new Date().toISOString() 
        } as any)
        .eq("user_id", userId);

      toast.info("Verification code generated. Please message the bot.");

      // Poll for connection
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from("profiles")
          .select("telegram_chat_id")
          .eq("user_id", userId)
          .single();
          
        if (data?.telegram_chat_id) {
          setChatId(data.telegram_chat_id);
          setPolling(false);
          setTelegramCode(null);
          toast.success("Telegram connected successfully!");
          clearInterval(interval);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(interval);
        setPolling(false);
        if (!chatId) {
          toast.error("Verification timeout. Please try again.");
          setTelegramCode(null);
        }
      }, 120000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate code");
      setPolling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Settings size={18} className="text-primary" /> Settings
        </h2>
        {telegramChatId && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            <CheckCircle2 size={10} /> Connected
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Telegram Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-primary" />
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telegram Integration</label>
            </div>
            <button 
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <HelpCircle size={10} /> {showSetupGuide ? "Hide Guide" : "Setup Guide"}
            </button>
          </div>

          <AnimatePresence>
            {showSetupGuide && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/10 text-xs space-y-3">
                  <p className="font-bold text-primary flex items-center gap-1.5">
                    <Bot size={14} /> How to set up your Telegram Bot:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
                    <li>Find <a href="https://t.me/botfather" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink size={10} /></a> on Telegram.</li>
                    <li>Send <code className="bg-primary/10 px-1 rounded text-primary font-mono">/newbot</code> and follow the instructions to create your bot.</li>
                    <li>Copy the <strong>HTTP API Token</strong> provided by BotFather.</li>
                    <li>Paste the token below and click <strong>Save</strong>.</li>
                    <li>Start your new bot and send it any message to initialize alerts.</li>
                  </ol>
                  <div className="pt-2 border-t border-primary/10">
                    <p className="font-bold text-primary flex items-center gap-1.5 mb-2">
                      <RefreshCw size={14} /> Or use our Central Bot:
                    </p>
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      If you don't want a custom bot, use the default <span className="text-primary font-bold">@{brand.ID === "USA" ? "TradesUSABot" : "TradesCanadaBot"}</span>. Click "Get Connection Code" below.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Custom Bot Token */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Bot Token (Optional)</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="7123456789:AAE..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="h-9 border-border/50 bg-background/50 text-xs font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 gap-1.5 shrink-0 px-4"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 size={14} />
                  ) : null}
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            <div className="relative flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">OR</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Connection Code */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Connection Code</label>
              {telegramCode ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-primary/20 shadow-inner">
                    <code className="text-xl font-bold font-mono text-primary tracking-widest flex-1 text-center">
                      {telegramCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(telegramCode)}
                      className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <a
                    href={`https://t.me/${brand.ID === "USA" ? "TradesUSABot" : "TradesCanadaBot"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all transition-colors"
                  >
                    <MessageCircle size={14} />
                    Open @{brand.ID === "USA" ? "TradesUSABot" : "TradesCanadaBot"}
                  </a>
                  {polling && (
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] justify-center animate-pulse">
                      <RefreshCw size={12} className="animate-spin" />
                      Waiting for you to message the bot...
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={generateTelegramCode} 
                  variant="outline" 
                  className="w-full h-10 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 gap-2 text-xs font-bold"
                >
                  <RefreshCw size={14} />
                  Get Connection Code
                </Button>
              )}
            </div>
          </div>

          <p className="mt-4 text-[10px] text-muted-foreground leading-relaxed">
            {brand.adjective} contractors receive instant Telegram alerts for high-value building permits the second they are issued.
          </p>Section
        </section>
      </div>
    </div>
  );
};

export default ProfileSettingsCard;
