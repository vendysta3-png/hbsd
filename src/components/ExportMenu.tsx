import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Retour } from "@/hooks/useRetours";

const COLUMNS = [
  { key: "date_heure_saisie", label: "Date saisie" },
  { key: "expediteur", label: "Expéditeur" },
  { key: "nombre_sacs", label: "Sacs" },
  { key: "quantite", label: "Quantité" },
  { key: "emplacement", label: "Emplacement" },
  { key: "receptionniste", label: "Réceptionniste" },
  { key: "etat", label: "État" },
  { key: "date_retour_recupere", label: "Date récupéré" },
];

function formatValue(r: Retour, key: string): string {
  if (key === "date_heure_saisie") return format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr });
  if (key === "date_retour_recupere") return r.date_retour_recupere ? format(new Date(r.date_retour_recupere), "dd/MM/yyyy HH:mm", { locale: fr }) : "—";
  if (key === "etat") return r.etat || "Disponible";
  if (key === "nombre_sacs") return r.nombre_sacs === -1 ? "GC" : String(r.nombre_sacs ?? 1);
  return (r as any)[key] || "—";
}

interface Props {
  retours: Retour[];
}

export default function ExportMenu({ retours }: Props) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [filterEtat, setFilterEtat] = useState("all");
  const [columns, setColumns] = useState<string[]>(COLUMNS.map((c) => c.key));

  const filtered = filterEtat === "all" ? retours : retours.filter((r) => (r.etat || "Disponible") === filterEtat);
  const selectedCols = COLUMNS.filter((c) => columns.includes(c.key));

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const buildData = () => filtered.map((r) => {
    const row: Record<string, string> = {};
    selectedCols.forEach((c) => { row[c.label] = formatValue(r, c.key); });
    return row;
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(buildData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Retours");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "retours.xlsx");
    toast.success("Export Excel réussi");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(buildData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "retours.csv");
    toast.success("Export CSV réussi");
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: selectedCols.length > 5 ? "landscape" : "portrait" });
    doc.setFontSize(14);
    doc.text("Liste des retours de colis", 14, 15);
    doc.setFontSize(9);
    doc.text(`Exporté le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })} · ${filtered.length} retour(s)`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [selectedCols.map((c) => c.label)],
      body: filtered.map((r) => selectedCols.map((c) => formatValue(r, c.key))),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("retours.pdf");
    toast.success("Export PDF réussi");
  };

  const handleExport = () => {
    if (columns.length === 0) { toast.error("Sélectionnez au moins une colonne"); return; }
    if (exportFormat === "xlsx") exportExcel();
    else if (exportFormat === "csv") exportCSV();
    else exportPDF();
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileDown className="h-4 w-4 text-status-available" /> Exporter
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Exporter les données</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filtrer par état</Label>
              <Select value={filterEtat} onValueChange={setFilterEtat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Retour récupéré">Retour récupéré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Colonnes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLUMNS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => toggleColumn(c.key)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      columns.includes(c.key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{filtered.length} retour(s) · {selectedCols.length} colonne(s)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleExport}>Exporter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
