import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Package, ChevronLeft, ChevronRight, History, ChevronDown, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Retour } from "@/hooks/useRetours";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  retours: Retour[];
  selectedRowId: string | null;
  onSelectRow: (id: string) => void;
  onEdit: (retour: Retour) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, etat: string) => void;
  onShowHistory: (retour: Retour) => void;
}

const PAGE_SIZES = [15, 25, 50, 100, "all"] as const;
type PageSize = (typeof PAGE_SIZES)[number];

function DetailRow({ retour }: { retour: Retour }) {
  return (
    <TableRow className="bg-muted/20 border-b">
      <TableCell colSpan={5} className="p-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="sm:hidden">
            <span className="text-muted-foreground text-xs">Date saisie</span>
            <p className="font-medium">{format(new Date(retour.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
          </div>
          <div className="md:hidden">
            <span className="text-muted-foreground text-xs">Emplacement</span>
            <p className="font-medium">{retour.emplacement}</p>
          </div>
          <div className="lg:hidden">
            <span className="text-muted-foreground text-xs">Sacs</span>
            <p className="font-medium">{retour.nombre_sacs === -1 ? "GC" : (retour.nombre_sacs ?? 1)}</p>
          </div>
          <div className="lg:hidden">
            <span className="text-muted-foreground text-xs">Date récupéré</span>
            <p className="font-medium">
              {retour.etat === "Retour récupéré" && retour.date_retour_recupere
                ? format(new Date(retour.date_retour_recupere), "dd/MM/yyyy HH:mm", { locale: fr })
                : "—"}
            </p>
          </div>
          <div className="xl:hidden">
            <span className="text-muted-foreground text-xs">Réceptionniste</span>
            <p className="font-medium">{retour.receptionniste || "—"}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function RetourTable({ retours, selectedRowId, onSelectRow, onEdit, onDelete, onStatusChange, onShowHistory }: Props) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(15);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const effectiveSize = pageSize === "all" ? retours.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(retours.length / effectiveSize));
  const paginated = pageSize === "all" ? retours : retours.slice(page * effectiveSize, (page + 1) * effectiveSize);

  const handlePageSizeChange = (value: string) => {
    const newSize = value === "all" ? ("all" as const) : (Number(value) as 15 | 25 | 50 | 100);
    setPageSize(newSize);
    setPage(0);
  };

  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
    onSelectRow(id);
  };

  if (retours.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Aucun retour trouvé</p>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-220px)]" type="always">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted sticky top-0 z-10">
                <TableHead className="w-8 xl:hidden"></TableHead>
                <TableHead>Expéditeur</TableHead>
                <TableHead className="hidden sm:table-cell">Date saisie</TableHead>
                <TableHead className="hidden lg:table-cell">Sacs</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead className="hidden md:table-cell">Emplacement</TableHead>
                <TableHead className="hidden xl:table-cell">Réceptionniste</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="hidden lg:table-cell">Date récupéré</TableHead>
                <TableHead className="sticky right-0 bg-muted z-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r) => {
                const isOverdue = (r.etat || "Disponible") === "Disponible" && differenceInDays(new Date(), new Date(r.date_heure_saisie)) >= 7;
                return (
                <>
                  <TableRow
                    key={r.id}
                    className={`cursor-pointer transition-colors h-10 ${
                      isOverdue ? "bg-destructive/5 hover:bg-destructive/10" :
                      selectedRowId === r.id ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleRowClick(r.id)}
                  >
                    <TableCell className="xl:hidden w-8 px-2">
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedRowId === r.id ? "rotate-180" : ""}`} />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
                        {r.expediteur}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.nombre_sacs === -1 ? "GC" : (r.nombre_sacs ?? 1)}</TableCell>
                    <TableCell>{r.quantite}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.emplacement}</TableCell>
                    <TableCell className="hidden xl:table-cell">{r.receptionniste || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        r.etat === "Retour récupéré"
                          ? "bg-status-recovered/15 text-status-recovered"
                          : "bg-status-available/15 text-status-available"
                      }`}>
                        <Package className="h-3 w-3" />
                        {r.etat || "Disponible"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">
                      {r.etat === "Retour récupéré" && r.date_retour_recupere
                        ? format(new Date(r.date_retour_recupere), "dd/MM/yyyy HH:mm", { locale: fr })
                        : "—"}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background z-10">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onShowHistory(r); }} title="Historique">
                          <History className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(r); }}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRowId === r.id && <DetailRow key={`detail-${r.id}`} retour={r} />}
                </>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{retours.length} retour{retours.length > 1 ? "s" : ""} · Page {page + 1}/{totalPages}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Lignes :</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={String(s)} value={String(s)}>
                    {s === "all" ? "Tous" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
