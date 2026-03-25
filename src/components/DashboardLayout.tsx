import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Package, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import NotificationHistory from "@/components/NotificationHistory";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { appName, logoUrl } = useBranding();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="no-print sticky top-0 z-20 flex h-12 items-center justify-between bg-primary px-4 text-primary-foreground shadow-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" />
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-6 w-6 rounded object-contain" />
              ) : (
                <Package className="h-5 w-5" />
              )}
              <span className="font-semibold text-sm">{appName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-80 hidden sm:block">{user?.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <NotificationHistory open={showNotifications} onOpenChange={setShowNotifications} />
    </SidebarProvider>
  );
}
