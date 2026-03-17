import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Retour } from "@/hooks/useRetours";

interface Props {
  retours: Retour[];
  selectedRowId: string | null;
  onSelectRow: (id: string) => void;
  onEdit: (retour: Retour) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, etat: string) => void;
}

export default function RetourTable({ retours, selectedRowId, onSelectRow, onEdit, onDelete, onStatusChange }: Props) {
  if (retours.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Aucun retour trouvé</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Expéditeur</TableHead>
          <TableHead>Sacs</TableHead>
          <TableHead>Quantité</TableHead>
          <TableHead>Emplacement</TableHead>
          <TableHead>Réceptionniste</TableHead>
          <TableHead>État</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {retours.map((r) => (
          <TableRow
            key={r.id}
            className={`cursor-pointer transition-colors ${
              selectedRowId === r.id ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelectRow(r.id)}
          >
            <TableCell>{format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
            <TableCell className="font-medium">{r.expediteur}</TableCell>
            <TableCell>{r.nombre_sacs ?? 1}</TableCell>
            <TableCell>{r.quantite}</TableCell>
            <TableCell>{r.emplacement}</TableCell>
            <TableCell>{r.receptionniste || "—"}</TableCell>
            <TableCell>
              <Select value={r.etat || "Disponible"} onValueChange={(v) => { onStatusChange(r.id, v); }}>
                <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3 text-green-500" /> Disponible</span>
                  </SelectItem>
                  <SelectItem value="Récupéré">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3 text-blue-500" /> Récupéré</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(r); }}>
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
