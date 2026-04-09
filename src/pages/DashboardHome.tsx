import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRetours } from "@/hooks/useRetours";
import StatsCards from "@/components/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Package, AlertTriangle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const { data: retours = [] } = useRetours();
  const { data: totalAllRetours = 0 } = useQuery({
    queryKey: ["retours-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("retours_colis")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const navigate = useNavigate();
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const recentRetours = retours.slice(0, 10);
  const overdueRetours = retours.filter(
    (r) => (r.etat || "Disponible") === "Disponible" && differenceInDays(new Date(), new Date(r.date_heure_saisie)) >= 7
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble des retours de colis</p>
      </div>
      <StatsCards retours={retours} />

      {overdueRetours.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10">
          <button
            type="button"
            className="flex items-center justify-between w-full p-4 text-left"
            onClick={() => setOverdueExpanded(!overdueExpanded)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">
                {overdueRetours.length} retour{overdueRetours.length > 1 ? "s" : ""} non récupéré{overdueRetours.length > 1 ? "s" : ""} depuis plus de 7 jours
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-destructive transition-transform duration-200 ${overdueExpanded ? "rotate-180" : ""}`} />
          </button>
          {overdueExpanded && (
            <div className="px-4 pb-4">
              <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                {overdueRetours.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 text-sm text-destructive/80 cursor-pointer hover:bg-destructive/10 rounded px-2 py-1"
                    onClick={() => navigate(`/retours?selected=${r.id}`)}
                  >
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-medium">{r.expediteur}</span>
                    <span className="text-muted-foreground">—</span>
                    <span>{differenceInDays(new Date(), new Date(r.date_heure_saisie))} jours · {r.emplacement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Retours récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRetours.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun retour enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Emplac.</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRetours.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/retours?selected=${r.id}`)}
                  >
                    <TableCell className="text-xs">{format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell className="font-medium">{r.expediteur}</TableCell>
                    <TableCell>{r.quantite}</TableCell>
                    <TableCell>{r.emplacement}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
