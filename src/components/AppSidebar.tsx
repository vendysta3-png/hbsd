import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, Package, Users, Settings, Database, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useBranding } from "@/hooks/useBranding";
import { useRetours } from "@/hooks/useRetours";
import { differenceInDays } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard, iconColor: "text-blue-500" },
  { title: "Retours", url: "/retours", icon: Package, iconColor: "text-orange-500" },
  { title: "Utilisateurs", url: "/users", icon: Users, iconColor: "text-green-500" },
  { title: "Base De Donnée", url: "/database", icon: Database, iconColor: "text-cyan-500" },
  { title: "Paramètres", url: "/settings", icon: Settings, iconColor: "text-purple-500" },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { appName, logoUrl } = useBranding();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-5 w-5 rounded object-contain mr-2 inline" />
            ) : (
              <span className="mr-1">📦</span>
            )}
            {appName}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    className="cursor-pointer"
                  >
                    <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={collapsed ? "p-1 flex flex-col items-center gap-1" : "p-4 space-y-1"}>
        {collapsed ? (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-yellow-400" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-destructive" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-yellow-400" />}
              <span>{theme === "light" ? "Mode sombre" : "Mode clair"}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-destructive" />
              <span>Déconnexion</span>
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
