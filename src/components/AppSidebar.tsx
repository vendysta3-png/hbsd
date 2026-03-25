import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, Package, Users, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

const navItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard, iconColor: "text-blue-500" },
  { title: "Retours", url: "/retours", icon: Package, iconColor: "text-orange-500" },
  { title: "Utilisateurs", url: "/users", icon: Users, iconColor: "text-green-500" },
  { title: "Paramètres", url: "/settings", icon: Settings, iconColor: "text-purple-500" },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
              📦 Gestion Retours
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => navigate(item.url)}
                          isActive={location.pathname === item.url}
                          className="cursor-pointer"
                        >
                          <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent
                          side="right"
                          className="bg-popover text-popover-foreground border rounded-md px-3 py-1.5 text-sm shadow-md z-50"
                        >
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className={collapsed ? "p-1 flex flex-row items-center justify-center gap-0" : "p-4 space-y-1"}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
                    {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border rounded-md px-3 py-1.5 text-sm shadow-md z-50">
                  {theme === "light" ? "Mode sombre" : "Mode clair"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border rounded-md px-3 py-1.5 text-sm shadow-md z-50">
                  Déconnexion
                </TooltipContent>
              </Tooltip>
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
    </TooltipProvider>
  );
}
