import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  useEffect(() => {
    const channel = supabase
      .channel("retours-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "retours_colis" },
        (payload) => {
          const r = payload.new as any;
          toast.info(`Nouveau retour : ${r.expediteur} — ${r.quantite} colis`, {
            description: `Emplacement: ${r.emplacement}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
