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

const NUMBERS = Array.from({ length: 50 }, (_, i) => String(i + 1));
const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const EMPLACEMENT_OPTIONS = [...NUMBERS, ...LETTERS];
const NUM_OPTIONS = Array.from({ length: 9 }, (_, i) => String(i + 1));
const ZONES = ["Fou9", "Wast", "Ta7t"] as const;

function parseEmplacement(emp: string) {
  if (!emp) return { base: "", num: "", zones: [] as string[] };
  const parts = emp.split(",").map((s) => s.trim()).filter(Boolean);
  const zones: string[] = [];
  let base = "";
  let num = "";
  for (const p of parts) {
    if ((ZONES as readonly string[]).includes(p)) {
      zones.push(p);
    } else if (!base) {
      // Check if format is "A - 3"
      const match = p.match(/^([A-Z])\s*-\s*(\d)$/);
      if (match) {
        base = match[1];
        num = match[2];
      } else {
        base = p;
      }
    }
  }
  return { base, num, zones };
}

function buildEmplacement(base: string, num: string, zones: string[]) {
  const baseWithNum = base && num && LETTERS.includes(base) ? `${base} - ${num}` : base;
  const parts = [baseWithNum, ...zones].filter(Boolean);
  return parts.join(", ");
}

export default function RetourForm({ initialData, onSubmit }: Props) {
  const { data: receptionnistes = [] } = useReceptionnistes();

  const parsedEmp = parseEmplacement(initialData?.emplacement || "");
  const isGC = initialData?.nombre_sacs === -1;

  const [form, setForm] = useState({
    date_heure_saisie: initialData?.date_heure_saisie
      ? toLocalDatetime(initialData.date_heure_saisie)
      : toLocalDatetime(new Date().toISOString()),
    expediteur: initialData?.expediteur || "",
    quantite: initialData?.quantite || "",
    emplacementBase: parsedEmp.base,
    emplacementNum: parsedEmp.num,
    receptionniste: initialData?.receptionniste || "",
    nombre_sacs: isGC ? 1 : (initialData?.nombre_sacs || 1),
    grands_colis: isGC,
    etat: initialData?.etat || "Disponible",
    date_retour_recupere: initialData?.date_retour_recupere
      ? toLocalDatetime(initialData.date_retour_recupere)
      : "",
    zones: parsedEmp.zones,
  });

  const handleZoneToggle = (zone: string) => {
    setForm((prev) => ({
      ...prev,
      zones: prev.zones.includes(zone) ? [] : [zone],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      date_heure_saisie: new Date(form.date_heure_saisie).toISOString(),
      expediteur: form.expediteur,
      quantite: form.quantite,
      emplacement: buildEmplacement(form.emplacementBase, form.emplacementNum, form.zones),
      receptionniste: form.receptionniste,
      nombre_sacs: form.grands_colis ? -1 : form.nombre_sacs,
      etat: form.etat,
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
          <div className="flex items-center justify-between">
            <Label>{form.grands_colis ? "Grands colis" : "Nombre de sacs"}</Label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={form.grands_colis}
                onChange={(e) => setForm({ ...form, grands_colis: e.target.checked, zones: e.target.checked ? form.zones : [] })}
                className="rounded border-border accent-primary h-4 w-4"
              />
              <span className="text-muted-foreground">Grands colis</span>
            </label>
          </div>
          {form.grands_colis ? (
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50 text-sm font-medium text-primary">
              GC
            </div>
          ) : (
            <Input
              type="number"
              value={form.nombre_sacs}
              onChange={(e) => setForm({ ...form, nombre_sacs: e.target.value })}
              required
            />
          )}
        </div>
        <div className="space-y-2">
          <Label>Quantité</Label>
          <Input 
            type="number"
            value={form.quantite} 
            onChange={(e) => setForm({ ...form, quantite: e.target.value })} 
            required 
          />
        </div>
      </div>

      {/* Emplacement */}
      <div className="space-y-2">
        <Label>Emplacement</Label>
        <Select
          value={form.emplacementBase}
          onValueChange={(v) => setForm({ ...form, emplacementBase: v, emplacementNum: LETTERS.includes(v) ? form.emplacementNum : "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner (1-50 ou A-Z)" />
          </SelectTrigger>
          <SelectContent className="max-h-56">
            {EMPLACEMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <Label className={!LETTERS.includes(form.emplacementBase) ? "opacity-50" : ""}>Num</Label>
            <Select
              value={form.emplacementNum}
              onValueChange={(v) => setForm({ ...form, emplacementNum: v })}
              disabled={!LETTERS.includes(form.emplacementBase)}
            >
              <SelectTrigger className={!LETTERS.includes(form.emplacementBase) ? "opacity-50" : ""}>
                <SelectValue placeholder="Num" />
              </SelectTrigger>
              <SelectContent>
                {NUM_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {ZONES.map((zone) => (
            <label key={zone} className={`flex items-center gap-1.5 text-sm ${form.grands_colis ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <input
                type="checkbox"
                checked={form.zones.includes(zone)}
                onChange={() => handleZoneToggle(zone)}
                disabled={!form.grands_colis}
                className="rounded border-border accent-primary h-4 w-4"
              />
              <span className="text-foreground">{zone}</span>
            </label>
          ))}
        </div>
        {(form.emplacementBase || form.zones.length > 0) && (
          <p className="text-xs text-muted-foreground mt-1">
            Résultat : <span className="font-medium text-foreground">{buildEmplacement(form.emplacementBase, form.emplacementNum, form.zones)}</span>
          </p>
        )}
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
