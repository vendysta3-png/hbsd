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
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <StatsCards retours={retours} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Retours récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRetours.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun retour enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRetours.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => navigate(`/retours?selected=${r.id}`)}
                  >
                    <TableCell>{format(new Date(r.date_heure_saisie), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{r.expediteur}</TableCell>
                    <TableCell>{r.quantite}</TableCell>
                    <TableCell>{r.emplacement}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        r.etat === "Récupéré" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
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
