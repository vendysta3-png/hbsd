import { useState, useEffect } from "react";
import { useRetours, useCreateRetour, useUpdateRetour, useDeleteRetour } from "@/hooks/useRetours";
import { useSearchParams } from "react-router-dom";
import RetourTable from "@/components/RetourTable";
import RetourForm from "@/components/RetourForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function RetoursPage() {
  const { data: retours = [], isLoading } = useRetours();
  const createRetour = useCreateRetour();
  const updateRetour = useUpdateRetour();
  const deleteRetour = useDeleteRetour();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRetour, setEditingRetour] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Auto-select row from URL param (from dashboard click)
  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedRowId(selected);
  }, [searchParams]);

  const filtered = retours.filter((r) =>
    [r.expediteur, r.emplacement, r.quantite, r.receptionniste, r.etat]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(retours);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Retours");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "retours.xlsx");
    toast.success("Export Excel réussi");
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Liste des retours</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setEditingRetour(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 text-primary-foreground" /> Nouveau
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4 text-green-500" /> Excel
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 text-purple-500" /> Imprimer
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <RetourTable
          retours={filtered}
          selectedRowId={selectedRowId}
          onSelectRow={(id) => setSelectedRowId(selectedRowId === id ? null : id)}
          onEdit={(r) => { setEditingRetour(r); setShowForm(true); }}
          onDelete={(id) => {
            if (window.confirm("Supprimer ce retour ?")) deleteRetour.mutate(id);
          }}
          onStatusChange={(id, etat) => updateRetour.mutate({ id, etat, date_retour_recupere: etat === "Retour récupéré" ? new Date().toISOString() : null })}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRetour ? "Modifier le retour" : "Nouveau retour"}</DialogTitle>
          </DialogHeader>
          <RetourForm
            initialData={editingRetour}
            onSubmit={(data) => {
              if (editingRetour) {
                updateRetour.mutate({ id: editingRetour.id, ...data });
              } else {
                createRetour.mutate(data);
              }
              setShowForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
