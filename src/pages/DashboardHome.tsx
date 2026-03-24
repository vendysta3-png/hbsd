import { useRetours } from "@/hooks/useRetours";
import StatsCards from "@/components/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const { data: retours = [] } = useRetours();
  const navigate = useNavigate();
  const recentRetours = retours.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble des retours de colis</p>
      </div>
      <StatsCards retours={retours} />

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
