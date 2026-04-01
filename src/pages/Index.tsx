import { Helmet } from "react-helmet-async";
import { brand } from "@/lib/brandConfig";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import ROICalculator from "@/components/ROICalculator";
import MarketsSection from "@/components/MarketsSection";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-primary/30 selection:text-primary-foreground">
      {/* Premium Mesh Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] bottom-[10%] h-[30%] w-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
        <div className="absolute left-[20%] top-[30%] h-[20%] w-[20%] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <Helmet>
        <title>{brand.name} — Exclusive Leads for {brand.adjective} Contractors</title>
        <meta name="description" content={`AI-powered permit intelligence and lead scoring for ${brand.adjective} trade contractors. Claim exclusive, qualified project leads in your market.`} />
      </Helmet>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <Navbar />
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <ROICalculator />
        <PricingSection />
        <MarketsSection />
        <LeadCaptureSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
