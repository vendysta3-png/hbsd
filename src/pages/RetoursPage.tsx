import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRetours, useCreateRetour, useUpdateRetour, useDeleteRetour } from "@/hooks/useRetours";
import { useLogRetourAction } from "@/hooks/useRetourHistory";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import RetourTable from "@/components/RetourTable";
import RetourForm from "@/components/RetourForm";
import PrintDialog from "@/components/PrintDialog";
import RetourHistoryDialog from "@/components/RetourHistoryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Search, Printer, Users, Upload, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";
import ReceptionnistesManager from "@/components/ReceptionnistesManager";
import ExportMenu from "@/components/ExportMenu";
import ImportDialog from "@/components/ImportDialog";
import { toast } from "sonner";

export default function RetoursPage() {
  const { isAdmin } = useAuth();
  
  const { data: retours = [], isLoading } = useRetours();
  const createRetour = useCreateRetour();
  const updateRetour = useUpdateRetour();
  const deleteRetour = useDeleteRetour();
  const logAction = useLogRetourAction();
  const [search, setSearch] = useState("");
  const [filterEtat, setFilterEtat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRetour, setEditingRetour] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [showReceptionnistes, setShowReceptionnistes] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [historyRetour, setHistoryRetour] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedRowId(selected);
  }, [searchParams]);

  const filtered = retours
    .filter((r) => filterEtat === "all" || (r.etat || "Disponible") === filterEtat)
    .filter((r) =>
      [r.expediteur, r.emplacement, r.quantite, r.receptionniste, r.etat]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
    );


  // Export is handled by ExportMenu component

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[150px] max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterEtat} onValueChange={setFilterEtat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par état" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les états</SelectItem>
            <SelectItem value="Disponible">Disponible</SelectItem>
            <SelectItem value="Retour récupéré">Retour récupéré</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setEditingRetour(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Nouveau
          </Button>
          <ExportMenu retours={retours} />
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 text-status-available" /> Importer
          </Button>
          <Button variant="outline" onClick={() => setShowPrint(true)}>
            <Printer className="h-4 w-4 text-primary" /> Imprimer
          </Button>
          {isAdmin && (
            <Button variant="outline" onClick={() => setShowReceptionnistes(true)}>
              <Users className="h-4 w-4 text-primary" /> Réceptionnistes
            </Button>
          )}
        </div>
      </div>


      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <RetourTable
          retours={filtered}
          selectedRowId={selectedRowId}
          onSelectRow={(id) => setSelectedRowId(selectedRowId === id ? null : id)}
          onEdit={(r) => { setEditingRetour(r); setShowForm(true); }}
          onDelete={(id) => setDeleteConfirmId(id)}
          onStatusChange={(id, etat) => {
            const retour = retours.find(r => r.id === id);
            updateRetour.mutate(
              { id, etat, date_retour_recupere: etat === "Retour récupéré" ? new Date().toISOString() : null },
              {
                onSuccess: () => {
                  logAction.mutate({ retour_id: id, action: "changement_état", details: { etat: { from: retour?.etat || "Disponible", to: etat } } });
                }
              }
            );
          }}
          onShowHistory={(r) => setHistoryRetour(r)}
        />
      )}

      <PrintDialog open={showPrint} onOpenChange={setShowPrint} retours={filtered} />

      <Dialog open={showReceptionnistes} onOpenChange={setShowReceptionnistes}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gérer les réceptionnistes</DialogTitle></DialogHeader>
          <ReceptionnistesManager />
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg w-full mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRetour ? "Modifier le retour" : "Nouveau retour"}</DialogTitle>
          </DialogHeader>
          <RetourForm
            initialData={editingRetour}
            onSubmit={(data) => {
              if (editingRetour) {
                const changes: Record<string, any> = {};
                for (const key of Object.keys(data)) {
                  if (data[key] !== editingRetour[key]) {
                    changes[key] = { from: editingRetour[key], to: data[key] };
                  }
                }
                updateRetour.mutate({ id: editingRetour.id, ...data }, {
                  onSuccess: () => {
                    logAction.mutate({ retour_id: editingRetour.id, action: "modification", details: changes });
                  }
                });
              } else {
                createRetour.mutate(data, {
                  onSuccess: (created) => {
                    logAction.mutate({ retour_id: created.id, action: "création", details: { expediteur: data.expediteur } });
                  }
                });
              }
              setShowForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

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
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce retour ? Cette action est irréversible.
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
                  const retour = retours.find(r => r.id === deleteConfirmId);
                  deleteRetour.mutate(deleteConfirmId, {
                    onSuccess: () => {
                      logAction.mutate({ retour_id: deleteConfirmId, action: "suppression", details: { expediteur: retour?.expediteur } });
                    }
                  });
                  setDeleteConfirmId(null);
                }
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportDialog open={showImport} onOpenChange={setShowImport} />
    </div>
  );
}
