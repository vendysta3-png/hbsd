import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Retour = Tables<"retours_colis">;

async function fetchAllRetours(archived: boolean): Promise<Retour[]> {
  const PAGE_SIZE = 1000;
  let allData: Retour[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("retours_colis")
      .select("*")
      .eq("archived", archived)
      .order("date_heure_saisie", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    allData = allData.concat(data as Retour[]);
    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allData;
}

export function useRetours() {
  return useQuery({
    queryKey: ["retours"],
    queryFn: () => fetchAllRetours(false),
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
      const { error } = await supabase.from("retours_colis").update({ archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      qc.invalidateQueries({ queryKey: ["archived-retours"] });
      toast.success("Retour archivé");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}

export function useArchivedRetours() {
  return useQuery({
    queryKey: ["archived-retours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retours_colis")
        .select("*")
        .eq("archived", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Retour[];
    },
  });
}

export function useRestoreRetour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retours_colis").update({ archived: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      qc.invalidateQueries({ queryKey: ["archived-retours"] });
      toast.success("Retour restauré");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}

export function usePermanentDeleteRetour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retours_colis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["archived-retours"] });
      toast.success("Retour supprimé définitivement");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
}
