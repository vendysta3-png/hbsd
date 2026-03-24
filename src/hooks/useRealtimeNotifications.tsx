import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { triggerNotification } from "@/components/AnimatedNotification";

export function useRealtimeNotifications() {
  useEffect(() => {
    const channel = supabase
      .channel("retours-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "retours_colis" },
        (payload) => {
          const r = payload.new as any;
          triggerNotification({
            id: r.id,
            expediteur: r.expediteur,
            quantite: r.quantite,
            emplacement: r.emplacement,
            etat: r.etat || "Disponible",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
