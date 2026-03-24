import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RecoveredRetour {
  id: string;
  expediteur: string;
  quantite: string;
  emplacement: string;
  date_retour_recupere: string;
}

export default function NotificationHistory({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [items, setItems] = useState<RecoveredRetour[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("retours_colis")
      .select("id, expediteur, quantite, emplacement, date_retour_recupere")
      .eq("etat", "Retour récupéré")
      .not("date_retour_recupere", "is", null)
      .order("date_retour_recupere", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setItems(data as RecoveredRetour[]);
      });
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Historique des récupérations
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">Aucune récupération enregistrée</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-recovered/20 flex items-center justify-center">
                  <Package className="h-4 w-4 text-status-recovered" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.expediteur}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantite} colis · {item.emplacement}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(item.date_retour_recupere), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
