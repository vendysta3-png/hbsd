import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Receptionniste {
  id: string;
  nom: string;
  created_at: string | null;
}

export function useReceptionnistes() {
  return useQuery({
    queryKey: ["receptionnistes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receptionnistes")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Receptionniste[];
    },
  });
}

export function useCreateReceptionniste() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nom: string) => {
      const { data, error } = await supabase
        .from("receptionnistes")
        .insert({ nom })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receptionnistes"] });
      toast.success("Réceptionniste ajouté");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}

export function useDeleteReceptionniste() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("receptionnistes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receptionnistes"] });
      toast.success("Réceptionniste supprimé");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}
