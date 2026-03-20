import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  plan: string | null;
  subscription_end: string | null;
}

export function useSubscription() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { subscribed: false, product_id: null, plan: null, subscription_end: null };

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      return data as SubscriptionStatus;
    },
    refetchInterval: 60_000, // every minute
    staleTime: 30_000,
  });

  // Refresh on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return query;
}

export async function openCustomerPortal() {
  const { data, error } = await supabase.functions.invoke("customer-portal");
  if (error) throw error;
  if (data?.url) window.open(data.url, "_blank");
}
