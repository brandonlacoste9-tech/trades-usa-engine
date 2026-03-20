import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Copy,
  CheckCircle2,
  QrCode,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface ShareBookingCardProps {
  userId: string;
  companyName: string | null;
}

const ShareBookingCard = ({ userId, companyName }: ShareBookingCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const bookingUrl = `${origin}/book/${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast.success("Booking link copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `booking-qr-${companyName?.replace(/\s/g, "-") || "trades-usa"}.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Link2 size={18} className="text-primary" /> Share Booking Link
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Share this link so clients can book estimates directly with you.
      </p>

      {/* Copy URL */}
      <div className="mt-4 flex gap-2">
        <Input
          readOnly
          value={bookingUrl}
          className="h-9 border-border/50 bg-background/50 text-xs font-mono"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="h-9 shrink-0 gap-1.5"
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQR(!showQR)}
          className="h-8 gap-1.5 text-xs"
        >
          <QrCode size={14} />
          {showQR ? "Hide QR" : "QR Code"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(bookingUrl, "_blank")}
          className="h-8 gap-1.5 text-xs"
        >
          <ExternalLink size={14} />
          Preview
        </Button>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div
            ref={qrRef}
            className="rounded-xl border border-border/30 bg-white p-4"
          >
            <QRCodeSVG
              value={bookingUrl}
              size={180}
              level="H"
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center max-w-[200px]">
            Print this QR on business cards, lawn signs, or vehicle wraps.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadQR}
            className="h-7 gap-1.5 text-xs"
          >
            <Download size={12} />
            Download PNG
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareBookingCard;
