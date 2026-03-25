import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette } from "lucide-react";
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
  const [activeColor, setActiveColor] = useState(() => localStorage.getItem("accent-color") || "25 95% 53%");

  const applyColor = (hue: string) => {
    setActiveColor(hue);
    localStorage.setItem("accent-color", hue);
    document.documentElement.style.setProperty("--primary", hue);
    document.documentElement.style.setProperty("--ring", hue);
    toast.success("Couleur appliquée");
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
    </div>
  );
}
