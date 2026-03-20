import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Package } from "lucide-react";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <header className="sticky top-0 z-20 flex h-12 items-center gap-2 bg-orange-500 px-4 text-white shadow-md">
            <SidebarTrigger className="text-white hover:bg-orange-600 hover:text-white" />
            <Package className="h-5 w-5" />
            <span className="font-semibold text-sm">Gestion des Retours de Colis</span>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
