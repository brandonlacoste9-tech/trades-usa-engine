import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, Loader2, CheckCircle2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileSettingsCardProps {
  userId: string;
  telegramChatId: string | null;
}

const ProfileSettingsCard = ({ userId, telegramChatId }: ProfileSettingsCardProps) => {
  const [chatId, setChatId] = useState(telegramChatId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChatId(telegramChatId || "");
  }, [telegramChatId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ telegram_chat_id: chatId || null } as any)
        .eq("user_id", userId);

      if (error) {
        toast.error("Failed to save settings");
      } else {
        toast.success("Telegram Chat ID saved");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Settings size={18} className="text-primary" /> Settings
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={14} className="text-primary" />
            <label className="text-xs font-medium">Telegram Chat ID</label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle size={12} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                <p>
                  To get your Chat ID, open Telegram and message{" "}
                  <span className="font-mono font-bold">@userinfobot</span>. It will reply
                  with your numeric Chat ID. Paste it here to receive elite permit alerts.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="h-9 border-border/50 bg-background/50 text-sm font-mono"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 gap-1.5 shrink-0"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={14} />
              ) : null}
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Empire Builder users receive instant Telegram alerts for elite permits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsCard;
