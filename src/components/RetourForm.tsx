import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReceptionnistes } from "@/hooks/useReceptionnistes";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
}

function toLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function RetourForm({ initialData, onSubmit }: Props) {
  const { data: receptionnistes = [] } = useReceptionnistes();
  const [form, setForm] = useState({
    date_heure_saisie: initialData?.date_heure_saisie
      ? toLocalDatetime(initialData.date_heure_saisie)
      : toLocalDatetime(new Date().toISOString()),
    expediteur: initialData?.expediteur || "",
    quantite: initialData?.quantite || "",
    emplacement: initialData?.emplacement || "",
    receptionniste: initialData?.receptionniste || "",
    nombre_sacs: initialData?.nombre_sacs || 1,
    etat: initialData?.etat || "Disponible",
    date_retour_recupere: initialData?.date_retour_recupere
      ? toLocalDatetime(initialData.date_retour_recupere)
      : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      ...form,
      date_heure_saisie: new Date(form.date_heure_saisie).toISOString(),
      date_retour_recupere:
        form.etat === "Retour récupéré" && form.date_retour_recupere
          ? new Date(form.date_retour_recupere).toISOString()
          : null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Date de saisie</Label>
        <Input
          type="datetime-local"
          value={form.date_heure_saisie}
          onChange={(e) => setForm({ ...form, date_heure_saisie: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Expéditeur</Label>
        <Input value={form.expediteur} onChange={(e) => setForm({ ...form, expediteur: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantité</Label>
          <Input value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Nombre de sacs</Label>
          <Input type="number" value={form.nombre_sacs} onChange={(e) => setForm({ ...form, nombre_sacs: parseInt(e.target.value) || 1 })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Emplacement</Label>
        <Input value={form.emplacement} onChange={(e) => setForm({ ...form, emplacement: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Réceptionniste</Label>
        <Select
          value={form.receptionniste}
          onValueChange={(v) => setForm({ ...form, receptionniste: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un réceptionniste" />
          </SelectTrigger>
          <SelectContent>
            {receptionnistes.map((r) => (
              <SelectItem key={r.id} value={r.nom}>{r.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>État</Label>
        <Select
          value={form.etat}
          onValueChange={(v) =>
            setForm({
              ...form,
              etat: v,
              date_retour_recupere:
                v === "Retour récupéré" && !form.date_retour_recupere
                  ? toLocalDatetime(new Date().toISOString())
                  : v === "Disponible"
                  ? ""
                  : form.date_retour_recupere,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Disponible">Disponible</SelectItem>
            <SelectItem value="Retour récupéré">Retour récupéré</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.etat === "Retour récupéré" && (
        <div className="space-y-2">
          <Label>Date de récupération</Label>
          <Input
            type="datetime-local"
            value={form.date_retour_recupere}
            onChange={(e) => setForm({ ...form, date_retour_recupere: e.target.value })}
            required
          />
        </div>
      )}
      <Button type="submit" className="w-full">
        {initialData ? "Mettre à jour" : "Enregistrer"}
      </Button>
    </form>
  );
}
