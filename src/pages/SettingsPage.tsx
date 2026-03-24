import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Download, Upload, Trash2, Palette } from "lucide-react";
import { saveAs } from "file-saver";

const COLOR_PRESETS = [
  { name: "Orange", hue: "25 95% 53%" },
  { name: "Bleu", hue: "221 83% 53%" },
  { name: "Vert", hue: "142 76% 36%" },
  { name: "Violet", hue: "270 60% 55%" },
  { name: "Rouge", hue: "0 84% 60%" },
  { name: "Teal", hue: "174 72% 40%" },
];

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState("");
  const [activeColor, setActiveColor] = useState(() => localStorage.getItem("accent-color") || "25 95% 53%");

  const applyColor = (hue: string) => {
    setActiveColor(hue);
    localStorage.setItem("accent-color", hue);
    document.documentElement.style.setProperty("--primary", hue);
    document.documentElement.style.setProperty("--ring", hue);
    toast.success("Couleur appliquée");
  };

  const handleBackup = async () => {
    setLoading("backup");
    try {
      const { data: retours, error: e1 } = await supabase.from("retours_colis").select("*");
      if (e1) throw e1;
      const { data: receptionnistes, error: e2 } = await supabase.from("receptionnistes").select("*");
      if (e2) throw e2;
      const backup = { retours_colis: retours, receptionnistes, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      saveAs(blob, `sauvegarde_${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("Sauvegarde téléchargée");
    } catch (e: any) {
      toast.error("Erreur: " + e.message);
    } finally {
      setLoading("");
    }
  };

  const handleRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading("restore");
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (backup.retours_colis?.length) {
          const { error: delErr } = await supabase.from("retours_colis").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          if (delErr) throw delErr;
          const { error: insErr } = await supabase.from("retours_colis").insert(backup.retours_colis);
          if (insErr) throw insErr;
        }
        if (backup.receptionnistes?.length) {
          const { error: delErr } = await supabase.from("receptionnistes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          if (delErr) throw delErr;
          const { error: insErr } = await supabase.from("receptionnistes").insert(backup.receptionnistes);
          if (insErr) throw insErr;
        }
        toast.success("Restauration réussie");
      } catch (e: any) {
        toast.error("Erreur: " + e.message);
      } finally {
        setLoading("");
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")) return;
    if (!window.confirm("Confirmation finale : suppression définitive.")) return;
    setLoading("clear");
    try {
      const { error: e1 } = await supabase.from("retours_colis").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("receptionnistes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (e2) throw e2;
      toast.success("Toutes les données ont été supprimées");
    } catch (e: any) {
      toast.error("Erreur: " + e.message);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" /> Paramètres
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Email : {user?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Couleur de l'interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.name}
                onClick={() => applyColor(c.hue)}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                  activeColor === c.hue ? "border-foreground scale-110 ring-2 ring-foreground/20" : "border-transparent"
                }`}
                style={{ backgroundColor: `hsl(${c.hue})` }}
                title={c.name}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde & Restauration</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={handleBackup} disabled={!!loading}>
                <Download className="h-4 w-4" />
                {loading === "backup" ? "En cours..." : "Sauvegarder (JSON)"}
              </Button>
              <Button variant="outline" onClick={handleRestore} disabled={!!loading}>
                <Upload className="h-4 w-4" />
                {loading === "restore" ? "En cours..." : "Restaurer"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Supprimer toutes les données (retours et réceptionnistes).
              </p>
              <Button variant="destructive" onClick={handleClearData} disabled={!!loading}>
                <Trash2 className="h-4 w-4" />
                {loading === "clear" ? "En cours..." : "Effacer toutes les données"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
