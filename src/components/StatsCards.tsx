import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, CheckCircle, CalendarDays } from "lucide-react";
import type { Retour } from "@/hooks/useRetours";

const stats = [
  { key: "total", label: "Total retours", icon: Package, iconColor: "text-blue-500" },
  { key: "disponible", label: "Disponibles", icon: MapPin, iconColor: "text-orange-500" },
  { key: "recupere", label: "Récupérés", icon: CheckCircle, iconColor: "text-green-500" },
  { key: "today", label: "Aujourd'hui", icon: CalendarDays, iconColor: "text-purple-500" },
];

export default function StatsCards({ retours }: { retours: Retour[] }) {
  const today = new Date().toDateString();
  const values: Record<string, number> = {
    total: retours.length,
    disponible: retours.filter((r) => r.etat === "Disponible" || !r.etat).length,
    recupere: retours.filter((r) => r.etat === "Récupéré").length,
    today: retours.filter((r) => new Date(r.date_heure_saisie).toDateString() === today).length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
            <s.icon className={`h-4 w-4 ${s.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{values[s.key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
