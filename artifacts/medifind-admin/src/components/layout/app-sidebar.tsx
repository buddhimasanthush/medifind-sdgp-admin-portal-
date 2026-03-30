import { Link, useLocation } from "wouter";
import {
  ActivitySquare,
  LayoutDashboard,
  Store,
  Users,
  FileScan,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../../../../lib/api-client-react/src/custom-fetch";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pharmacies", url: "/pharmacies", icon: Store },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "AI/OCR Logs", url: "/logs", icon: FileScan },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/me"],
    enabled: false, // Already fetched in App.tsx
  });

  const handleLogout = async () => {
    console.log("1️⃣ Logout button clicked");
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) {
      console.log("❌ Logout cancelled by user");
      return;
    }

    console.log("2️⃣ Confirmed — calling backend logout");
    try {
      const response = await customFetch("/api/logout", { method: "POST" });
      console.log("3️⃣ Backend logout response:", response);
    } catch (error) {
      console.error("3️⃣ Backend logout failed:", error);
    }

    console.log("4️⃣ Clearing React Query cache and local storage");
    queryClient.clear();
    queryClient.setQueryData(["/api/me"], null);
    
    // Attempt extra storage clear just in case any 3rd party lib was using it
    localStorage.clear();
    sessionStorage.clear();

    console.log("5️⃣ Query data after clear:", queryClient.getQueryData(["/api/me"]));
    
    const baseUrl = import.meta.env.BASE_URL || "/medifind-sdgp-admin-portal-/";
    const origin = window.location.origin;
    console.log("6️⃣ Redirecting to:", origin + baseUrl);
    
    window.location.replace(origin + baseUrl);
  };

  return (
    <Sidebar className="border-r border-white/10 bg-[#060606] text-white flex flex-col">
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ActivitySquare className="w-5 h-5 text-black" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            Medifind
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-6 flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-4 font-sans font-semibold">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`group rounded-xl h-11 transition-all duration-300 ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)] hover:bg-primary/20 hover:text-primary"
                          : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "text-muted-foreground group-hover:text-white"}`} />
                        <span className={`font-medium font-sans ${isActive ? "text-primary" : ""}`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <div className="px-2 mb-2">
          <p className="text-xs text-muted-foreground truncate font-sans">
            Signed in as
          </p>
          <p className="text-xs font-medium text-white truncate font-sans">
            {user?.username || "Admin"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-400/20 font-sans font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}