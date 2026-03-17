import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Retour = Tables<"retours_colis">;

export function useRetours() {
  return useQuery({
    queryKey: ["retours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retours_colis")
        .select("*")
        .order("date_heure_saisie", { ascending: false });
      if (error) throw error;
      return data as Retour[];
    },
  });
}

export function useCreateRetour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (retour: TablesInsert<"retours_colis">) => {
      const { data, error } = await supabase.from("retours_colis").insert(retour).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      toast.success("Retour créé avec succès");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}

export function useUpdateRetour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"retours_colis"> & { id: string }) => {
      const { data, error } = await supabase.from("retours_colis").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      toast.success("Retour mis à jour");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}

export function useDeleteRetour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retours_colis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      toast.success("Retour supprimé");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}
