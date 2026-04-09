import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, CalendarDays } from "lucide-react";
import type { Retour } from "@/hooks/useRetours";

const stats = [
  { key: "total", label: "Total retours", icon: Package, color: "var(--stat-total)" },
  { key: "disponible", label: "Disponible", icon: Clock, color: "var(--stat-disponible)" },
  { key: "recupere", label: "Récupéré", icon: CheckCircle, color: "var(--stat-recupere)" },
  { key: "today", label: "Récupéré aujourd'hui", icon: CalendarDays, color: "var(--stat-today)" },
];

export default function StatsCards({ retours, totalAllRetours }: { retours: Retour[]; totalAllRetours?: number }) {
  const today = new Date().toDateString();
  const values: Record<string, number> = {
    total: totalAllRetours ?? retours.length,
    disponible: retours.filter((r) => r.etat === "Disponible" || !r.etat).length,
    recupere: retours.filter((r) => r.etat === "Retour récupéré").length,
    today: retours.filter(
      (r) => r.etat === "Retour récupéré" && r.date_retour_recupere && new Date(r.date_retour_recupere).toDateString() === today
    ).length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card
          key={s.key}
          className="relative overflow-hidden"
          style={{ borderLeft: `4px solid hsl(${s.color})` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            <s.icon className="h-5 w-5" style={{ color: `hsl(${s.color})` }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: `hsl(${s.color})` }}>
              {values[s.key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
