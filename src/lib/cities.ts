export interface CityData {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  population: string;
  permits: string;
  growth: string;
  avgJobValue: string;
  topTrades: string[];
  description: string;
}

export const cities: CityData[] = [
  {
    slug: "new-york",
    city: "New York",
    state: "New York",
    stateCode: "NY",
    population: "8.3M",
    permits: "120,000+",
    growth: "8%",
    avgJobValue: "$85,000",
    topTrades: ["General Contracting", "Plumbing", "Electrical", "HVAC"],
    description: "The largest construction market in America. NYC contractors face fierce competition but massive opportunity — over 120,000 building permits issued annually.",
  },
  {
    slug: "los-angeles",
    city: "Los Angeles",
    state: "California",
    stateCode: "CA",
    population: "3.9M",
    permits: "85,000+",
    growth: "11%",
    avgJobValue: "$92,000",
    topTrades: ["Roofing", "Solar", "HVAC", "Landscaping", "Renovations"],
    description: "LA's booming construction market combines solar installations, earthquake retrofits, and luxury renovations — a goldmine for contractors who show up first.",
  },
  {
    slug: "chicago",
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    population: "2.7M",
    permits: "55,000+",
    growth: "7%",
    avgJobValue: "$68,000",
    topTrades: ["HVAC", "Plumbing", "Electrical", "Roofing", "Renovations"],
    description: "Chicago's extreme weather drives year-round demand for HVAC, roofing, and plumbing services. Over 55,000 permits keep contractors busy.",
  },
  {
    slug: "houston",
    city: "Houston",
    state: "Texas",
    stateCode: "TX",
    population: "2.3M",
    permits: "65,000+",
    growth: "16%",
    avgJobValue: "$75,000",
    topTrades: ["HVAC", "Plumbing", "Roofing", "Electrical", "Solar"],
    description: "Houston is one of the fastest-growing construction markets in America. With 16% annual growth and 65,000+ permits, the opportunity is massive.",
  },
  {
    slug: "phoenix",
    city: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    population: "1.6M",
    permits: "50,000+",
    growth: "18%",
    avgJobValue: "$72,000",
    topTrades: ["HVAC", "Roofing", "Solar", "Landscaping", "Pool Construction"],
    description: "Phoenix leads the nation in construction growth at 18%. Desert heat drives massive HVAC and solar demand, plus booming new residential builds.",
  },
  {
    slug: "philadelphia",
    city: "Philadelphia",
    state: "Pennsylvania",
    stateCode: "PA",
    population: "1.6M",
    permits: "35,000+",
    growth: "6%",
    avgJobValue: "$62,000",
    topTrades: ["Renovations", "Plumbing", "Electrical", "HVAC", "Roofing"],
    description: "Philadelphia's historic housing stock creates constant renovation demand. Contractors specializing in upgrades and retrofits thrive here.",
  },
  {
    slug: "dallas",
    city: "Dallas",
    state: "Texas",
    stateCode: "TX",
    population: "1.3M",
    permits: "48,000+",
    growth: "15%",
    avgJobValue: "$78,000",
    topTrades: ["HVAC", "Roofing", "Plumbing", "General Contracting"],
    description: "Dallas-Fort Worth's explosive population growth fuels one of the hottest construction markets in the Sun Belt, with 15% annual growth.",
  },
  {
    slug: "miami",
    city: "Miami",
    state: "Florida",
    stateCode: "FL",
    population: "6M metro",
    permits: "42,000+",
    growth: "13%",
    avgJobValue: "$95,000",
    topTrades: ["Roofing", "HVAC", "Hurricane Protection", "Plumbing"],
    description: "Miami's luxury market and hurricane season create year-round demand. High property values mean higher job tickets for smart contractors.",
  },
  {
    slug: "atlanta",
    city: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    population: "6M metro",
    permits: "38,000+",
    growth: "14%",
    avgJobValue: "$70,000",
    topTrades: ["HVAC", "Roofing", "Plumbing", "Landscaping", "Renovations"],
    description: "Atlanta's rapid expansion makes it a prime market for trade contractors. New subdivisions and commercial projects drive 14% annual construction growth.",
  },
  {
    slug: "seattle",
    city: "Seattle",
    state: "Washington",
    stateCode: "WA",
    population: "4M metro",
    permits: "30,000+",
    growth: "10%",
    avgJobValue: "$88,000",
    topTrades: ["Roofing", "Plumbing", "HVAC", "Electrical", "Renovations"],
    description: "Seattle's tech-driven economy and rainy climate fuel constant demand for quality contractors. High home values mean premium job tickets.",
  },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find((c) => c.slug === slug);
}
