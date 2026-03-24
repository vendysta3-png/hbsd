import { useState, useEffect, useRef } from "react";
import { Package, X } from "lucide-react";
import { cn } from "@/lib/utils";
import notificationSound from "@/assets/notification.wav";

interface NotificationData {
  id: string;
  expediteur: string;
  quantite: string;
  emplacement: string;
  etat: string;
}

let notifyFn: ((data: NotificationData) => void) | null = null;

export function triggerNotification(data: NotificationData) {
  notifyFn?.(data);
}

export function AnimatedNotificationBox() {
  const [notifications, setNotifications] = useState<(NotificationData & { visible: boolean })[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    notifyFn = (data) => {
      audioRef.current?.play().catch(() => {});
      const entry = { ...data, visible: true };
      setNotifications((prev) => [...prev, entry]);
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === data.id ? { ...n, visible: false } : n))
        );
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== data.id));
        }, 400);
      }, 6000);
    };
    return () => { notifyFn = null; };
  }, []);

  const dismiss = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, visible: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 400);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "pointer-events-auto rounded-xl border shadow-2xl p-4 transition-all duration-400",
            "bg-card text-card-foreground border-border",
            n.visible
              ? "animate-slide-in-right opacity-100 translate-x-0"
              : "opacity-0 translate-x-full"
          )}
          style={{
            boxShadow: n.etat === "Disponible"
              ? "0 0 20px hsl(var(--status-available) / 0.3), 0 8px 32px hsl(var(--status-available) / 0.15)"
              : "0 0 20px hsl(var(--status-recovered) / 0.3), 0 8px 32px hsl(var(--status-recovered) / 0.15)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center animate-pulse",
                n.etat === "Disponible"
                  ? "bg-status-available/20 text-status-available"
                  : "bg-status-recovered/20 text-status-recovered"
              )}
            >
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    n.etat === "Disponible"
                      ? "bg-status-available/15 text-status-available"
                      : "bg-status-recovered/15 text-status-recovered"
                  )}
                >
                  {n.etat || "Disponible"}
                </span>
                <button
                  onClick={() => dismiss(n.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="font-semibold mt-1.5 truncate">{n.expediteur}</p>
              <p className="text-sm text-muted-foreground">
                {n.quantite} colis · {n.emplacement}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "mt-3 h-1 rounded-full overflow-hidden",
              n.etat === "Disponible" ? "bg-status-available/10" : "bg-status-recovered/10"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full",
                n.etat === "Disponible" ? "bg-status-available" : "bg-status-recovered"
              )}
              style={{ animation: "shrink 6s linear forwards" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
