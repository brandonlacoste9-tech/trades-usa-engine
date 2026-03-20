import { Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Trades USA" className="h-6 w-6" />
            <span className="font-display text-lg font-bold">
              TRADES<span className="text-gradient-primary">USA</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#roi" className="hover:text-foreground">ROI Calculator</a>
            <a href="#markets" className="hover:text-foreground">Markets</a>
          </div>

          <a
            href="mailto:northern-ventures@outlook.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Mail size={14} />
            northern-ventures@outlook.com
          </a>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Trades USA — A Northern Ventures Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
