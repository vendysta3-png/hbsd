import { useState } from "react";
import { useReceptionnistes, useCreateReceptionniste, useDeleteReceptionniste } from "@/hooks/useReceptionnistes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export default function ReceptionnistesManager() {
  const { data: receptionnistes = [], isLoading } = useReceptionnistes();
  const createReceptionniste = useCreateReceptionniste();
  const deleteReceptionniste = useDeleteReceptionniste();
  const [nom, setNom] = useState("");

  const handleAdd = () => {
    const trimmed = nom.trim();
    if (!trimmed) return;
    createReceptionniste.mutate(trimmed, { onSuccess: () => setNom("") });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nom du réceptionniste"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!nom.trim()}>Ajouter</Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Chargement...</p>
      ) : receptionnistes.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucun réceptionniste configuré</p>
      ) : (
        <ul className="space-y-1">
          {receptionnistes.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm">{r.nom}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.confirm(`Supprimer "${r.nom}" ?`)) deleteReceptionniste.mutate(r.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
