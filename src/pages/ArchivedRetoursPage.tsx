import { useState } from "react";
import { useArchivedRetours, useRestoreRetour, usePermanentDeleteRetour } from "@/hooks/useRetours";
import { useLogRetourAction } from "@/hooks/useRetourHistory";
import { useAuth } from "@/hooks/useAuth";
import RetourHistoryDialog from "@/components/RetourHistoryDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, RotateCcw, Trash2, AlertTriangle, History, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ArchivedRetoursPage() {
  const { data: archived = [], isLoading } = useArchivedRetours();
  const restoreRetour = useRestoreRetour();
  const permanentDelete = usePermanentDeleteRetour();
  const logAction = useLogRetourAction();
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [historyRetour, setHistoryRetour] = useState<any>(null);

  const filtered = archived.filter((r) =>
    [r.expediteur, r.emplacement, r.quantite, r.receptionniste]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Archive className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-foreground">Retours archivés</h2>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucun retour archivé</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <ScrollArea className="h-[calc(100vh-220px)]" type="always">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted sticky top-0 z-10">
                  <TableHead>Expéditeur</TableHead>
                  <TableHead className="hidden sm:table-cell">Date saisie</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead className="hidden md:table-cell">Emplacement</TableHead>
                  <TableHead className="hidden lg:table-cell">Réceptionniste</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="sticky right-0 bg-muted z-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="h-10 hover:bg-muted/50">
                    <TableCell className="font-medium">{r.expediteur}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">
                      {format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>{r.quantite}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.emplacement}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.receptionniste || "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Archive className="h-3 w-3" />
                        Archivé
                      </span>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background z-10">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setHistoryRetour(r)} title="Historique">
                          <History className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Restaurer"
                          onClick={() => {
                            restoreRetour.mutate(r.id, {
                              onSuccess: () => {
                                logAction.mutate({ retour_id: r.id, action: "restauration", details: { expediteur: r.expediteur } });
                              },
                            });
                          }}
                        >
                          <RotateCcw className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Supprimer définitivement" onClick={() => setDeleteConfirmId(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <RetourHistoryDialog
        open={!!historyRetour}
        onOpenChange={(v) => { if (!v) setHistoryRetour(null); }}
        retourId={historyRetour?.id || null}
        expediteur={historyRetour?.expediteur}
      />

      <Dialog open={!!deleteConfirmId} onOpenChange={(v) => { if (!v) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Suppression définitive
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le retour sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) {
                  const retour = archived.find((r) => r.id === deleteConfirmId);
                  permanentDelete.mutate(deleteConfirmId, {
                    onSuccess: () => {
                      logAction.mutate({ retour_id: deleteConfirmId, action: "suppression_définitive", details: { expediteur: retour?.expediteur } });
                    },
                  });
                  setDeleteConfirmId(null);
                }
              }}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
