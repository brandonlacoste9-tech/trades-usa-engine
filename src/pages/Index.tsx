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
    <div className="min-h-screen bg-background">
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
  );
};

export default Index;
