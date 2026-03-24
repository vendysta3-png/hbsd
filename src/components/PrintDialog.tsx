import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Retour } from "@/hooks/useRetours";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ALL_COLUMNS = [
  { key: "date_heure_saisie", label: "Date saisie" },
  { key: "expediteur", label: "Expéditeur" },
  { key: "nombre_sacs", label: "Sacs" },
  { key: "quantite", label: "Quantité" },
  { key: "emplacement", label: "Emplacement" },
  { key: "receptionniste", label: "Réceptionniste" },
  { key: "etat", label: "État" },
  { key: "date_retour_recupere", label: "Date récupéré" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  retours: Retour[];
}

export default function PrintDialog({ open, onOpenChange, retours }: Props) {
  const [filterEtat, setFilterEtat] = useState("all");
  const [columns, setColumns] = useState<string[]>(ALL_COLUMNS.map((c) => c.key));

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const filtered = filterEtat === "all" ? retours : retours.filter((r) => (r.etat || "Disponible") === filterEtat);
  const selectedCols = ALL_COLUMNS.filter((c) => columns.includes(c.key));

  const handlePrint = () => {
    const formatVal = (r: Retour, key: string) => {
      if (key === "date_heure_saisie") return format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr });
      if (key === "date_retour_recupere") return r.date_retour_recupere ? format(new Date(r.date_retour_recupere), "dd/MM/yyyy HH:mm", { locale: fr }) : "—";
      if (key === "etat") return r.etat || "Disponible";
      if (key === "nombre_sacs") return String(r.nombre_sacs ?? 1);
      return (r as any)[key] || "—";
    };

    const html = `<!DOCTYPE html><html><head><title>Liste des retours</title>
    <style>
      body{font-family:Arial,sans-serif;margin:20px;color:#222}
      h1{font-size:18px;margin-bottom:10px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f5f5f5;font-weight:bold}
      .footer{margin-top:10px;font-size:10px;color:#999}
    </style></head><body>
    <h1>Liste des retours de colis</h1>
    <p style="font-size:12px;color:#666">Imprimé le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })} · ${filtered.length} retour(s)</p>
    <table><thead><tr>${selectedCols.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>${filtered.map((r) => `<tr>${selectedCols.map((c) => `<td>${formatVal(r, c.key)}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <div class="footer">Gestion des Retours de Colis</div>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimer la liste</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <Label>Colonnes à afficher</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_COLUMNS.map((c) => (
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
          <p className="text-sm text-muted-foreground">{filtered.length} retour(s) seront imprimés</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handlePrint}>Imprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
