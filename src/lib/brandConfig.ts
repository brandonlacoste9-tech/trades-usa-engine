export type Brand = "CANADA" | "USA";

export interface BrandConfig {
  ID: Brand;
  name: string;
  domain: string;
  country: string;
  adjective: string;
  defaultLocale: string;
  locales: string[];
  cities: string[];
  twitter: string;
  email: string;
  currency: string;
}

const BRANDS: Record<Brand, BrandConfig> = {
  CANADA: {
    ID: "CANADA",
    name: "Trades-Canada",
    domain: "trades-canada.com",
    country: "Canada",
    adjective: "Canadian",
    defaultLocale: "en",
    locales: ["en", "fr"],
    cities: ["Toronto", "Vancouver", "Calgary", "Montreal", "Ottawa"],
    twitter: "@tradescanada",
    email: "hello@trades-canada.com",
    currency: "CAD",
  },
  USA: {
    ID: "USA",
    name: "Trades-USA",
    domain: "trades-usa.com",
    country: "USA",
    adjective: "American",
    defaultLocale: "en",
    locales: ["en", "es"],
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
    twitter: "@tradesusa",
    email: "hello@trades-usa.com",
    currency: "USD",
  },
};

// Default to USA for this engine, but check env if available
export const BRAND_ID: Brand = (import.meta.env.VITE_BRAND as Brand) || "USA";
export const brand: BrandConfig = BRANDS[BRAND_ID];
