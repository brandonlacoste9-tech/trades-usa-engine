import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCityBySlug } from "@/lib/cities";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Building2, DollarSign, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CityLanding = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = citySlug ? getCityBySlug(citySlug) : undefined;

  if (!city) return <Navigate to="/" replace />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Trades USA — ${city.city}, ${city.stateCode}`,
    description: city.description,
    areaServed: {
      "@type": "City",
      name: city.city,
      containedInPlace: { "@type": "State", name: city.state },
    },
    url: `https://trades-usa.com/leads/${city.slug}`,
  };

  return (
    <>
      <Helmet>
        <title>{`Trade Contractor Leads in ${city.city}, ${city.stateCode} | Trades USA`}</title>
        <meta
          name="description"
          content={`Get exclusive contractor leads in ${city.city}, ${city.stateCode}. Our AI-powered platform delivers qualified homeowner leads directly to your phone. ${city.permits} permits annually.`}
        />
        <link rel="canonical" href={`https://trades-usa.com/leads/${city.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <MapPin size={14} />
                {city.city}, {city.stateCode}
              </div>

              <h1 className="font-display text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
                Trade Contractor Leads in{" "}
                <span className="text-gradient-primary">
                  {city.city}, {city.stateCode}
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {city.description}
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  Get {city.city} Leads <ArrowRight size={18} />
                </Button>
                <Button variant="hero-outline" size="lg" className="px-8">
                  See How It Works
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Building2, label: "Annual Permits", value: city.permits },
                { icon: TrendingUp, label: "Market Growth", value: city.growth },
                { icon: DollarSign, label: "Avg Job Value", value: city.avgJobValue },
                { icon: MapPin, label: "Metro Population", value: city.population },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl border border-border/50 bg-gradient-card p-6 text-center shadow-card"
                >
                  <stat.icon size={20} className="mx-auto text-primary" />
                  <div className="mt-3 font-display text-3xl font-bold text-gradient-primary">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Trades */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Top Trades in{" "}
                <span className="text-gradient-primary">{city.city}</span>
              </h2>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {city.topTrades.map((trade) => (
                  <span
                    key={trade}
                    className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary"
                  >
                    <Wrench size={14} />
                    {trade}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <LeadCaptureSection />
        <Footer />
      </div>
    </>
  );
};

export default CityLanding;
