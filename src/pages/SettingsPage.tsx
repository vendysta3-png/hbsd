import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useBranding } from "@/hooks/useBranding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Image, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const COLOR_PRESETS = [
  { name: "Orange", hue: "25 95% 53%" },
  { name: "Bleu", hue: "221 83% 53%" },
  { name: "Vert", hue: "142 76% 36%" },
  { name: "Violet", hue: "270 60% 55%" },
  { name: "Rouge", hue: "0 84% 60%" },
  { name: "Teal", hue: "174 72% 40%" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { appName, logoUrl, updateAppName, updateLogo } = useBranding();
  const [activeColor, setActiveColor] = useState(() => localStorage.getItem("accent-color") || "25 95% 53%");
  const [editingName, setEditingName] = useState(appName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyColor = (hue: string) => {
    setActiveColor(hue);
    localStorage.setItem("accent-color", hue);
    document.documentElement.style.setProperty("--primary", hue);
    document.documentElement.style.setProperty("--ring", hue);
    toast.success("Couleur appliquée");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error("L'image ne doit pas dépasser 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateLogo(ev.target?.result as string);
      toast.success("Logo mis à jour");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    updateLogo(null);
    toast.success("Logo supprimé");
  };

  const handleSaveName = () => {
    updateAppName(editingName);
    toast.success("Nom de l'application mis à jour");
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

      {/* Branding section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" /> Personnalisation de l'application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative group">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-16 w-16 rounded-lg object-contain border border-border bg-muted p-1"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Ajouter</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Max 500 Ko.</p>
            </div>
          </div>

          {/* App name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="text-base font-medium">Nom de l'application</Label>
            <div className="flex gap-2">
              <Input
                id="app-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Gestion Retours"
                className="max-w-xs"
              />
              <Button onClick={handleSaveName} disabled={editingName === appName}>
                Enregistrer
              </Button>
            </div>
          </div>
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
    </div>
  );
}
