import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRetourHistory } from "@/hooks/useRetourHistory";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { History, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  création: { label: "Création", icon: Plus, color: "text-status-available" },
  modification: { label: "Modification", icon: Pencil, color: "text-primary" },
  suppression: { label: "Suppression", icon: Trash2, color: "text-destructive" },
  changement_état: { label: "Changement d'état", icon: RefreshCw, color: "text-accent-foreground" },
};

function DetailsList({ details }: { details: Record<string, any> }) {
  const entries = Object.entries(details);
  if (entries.length === 0) return null;

  return (
    <ul className="mt-1 space-y-0.5">
      {entries.map(([key, val]) => {
        if (typeof val === "object" && val?.from !== undefined) {
          return (
            <li key={key} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{key}</span> : {String(val.from)} → {String(val.to)}
            </li>
          );
        }
        return (
          <li key={key} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{key}</span> : {String(val)}
          </li>
        );
      })}
    </ul>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  retourId: string | null;
  expediteur?: string;
}

export default function RetourHistoryDialog({ open, onOpenChange, retourId, expediteur }: Props) {
  const { data: history = [], isLoading } = useRetourHistory(open ? retourId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historique {expediteur ? `— ${expediteur}` : ""}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Chargement...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun historique enregistré</p>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            {history.map((entry, i) => {
              const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.modification;
              const Icon = config.icon;

              return (
                <div key={entry.id} className="relative flex gap-3 py-3">
                  <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {entry.user_email && (
                      <p className="text-xs text-muted-foreground">par {entry.user_email}</p>
                    )}
                    <DetailsList details={entry.details as Record<string, any>} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
