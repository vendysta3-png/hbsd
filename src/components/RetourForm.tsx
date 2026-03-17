import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function RetourForm({ initialData, onSubmit }: Props) {
  const [form, setForm] = useState({
    expediteur: initialData?.expediteur || "",
    quantite: initialData?.quantite || "",
    emplacement: initialData?.emplacement || "",
    receptionniste: initialData?.receptionniste || "",
    nombre_sacs: initialData?.nombre_sacs || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Input value={form.receptionniste} onChange={(e) => setForm({ ...form, receptionniste: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Mettre à jour" : "Enregistrer"}
      </Button>
    </form>
  );
}
