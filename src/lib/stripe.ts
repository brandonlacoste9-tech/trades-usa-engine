// Stripe product/price mapping for Trades USA tiers
export const STRIPE_TIERS = {
  professional: {
    product_id: "prod_UBNfVAfC4e9AOT",
    price_id: "price_1TD0u7CzqBvMqSYFIuGoMdXO",
    plan_key: "lead_engine",
    price: 499,
    name: "The Professional",
  },
  dominator: {
    product_id: "prod_UBNgZZnOo4ZbKR",
    price_id: "price_1TD0vDCzqBvMqSYFR3L8J0iG",
    plan_key: "market_dominator",
    price: 899,
    name: "The Market Dominator",
  },
  empire: {
    product_id: "prod_UBNgMo4mtvj4cc",
    price_id: "price_1TD0vbCzqBvMqSYFRukx5pg1",
    plan_key: "empire_builder",
    price: 1999,
    name: "The Empire Builder",
  },
} as const;

// Map plan names to tier keys
export const PLAN_TO_TIER: Record<string, keyof typeof STRIPE_TIERS> = {
  lead_engine: "professional",
  market_dominator: "dominator",
  empire_builder: "empire",
};

export function getTierByPlanKey(planKey: string | null | undefined) {
  if (!planKey) return null;
  const tierKey = PLAN_TO_TIER[planKey];
  return tierKey ? STRIPE_TIERS[tierKey] : null;
}
