import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HistoryEntry {
  id: string;
  retour_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  user_email: string | null;
}

export function useRetourHistory(retourId: string | null) {
  return useQuery({
    queryKey: ["retour-history", retourId],
    enabled: !!retourId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retours_historique")
        .select("*")
        .eq("retour_id", retourId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HistoryEntry[];
    },
  });
}

export function useLogRetourAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { retour_id: string; action: string; details?: Record<string, any> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("retours_historique").insert({
        retour_id: entry.retour_id,
        action: entry.action,
        details: entry.details || {},
        user_email: user?.email || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["retour-history", vars.retour_id] });
    },
  });
}
