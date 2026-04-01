import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return data as Tables<"profiles"> | null;
    },
  });
}

export function isEmpireBuilder(plan: string | null | undefined): boolean {
  return plan === "empire_builder";
}

export function canViewElitePermits(plan: string | null | undefined): boolean {
  return plan === "empire_builder" || plan === "market_dominator";
}
