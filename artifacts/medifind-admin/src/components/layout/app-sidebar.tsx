import { Link, useLocation } from "wouter";
import {
  ActivitySquare,
  LayoutDashboard,
  Store,
  Users,
  FileScan,
  ShoppingCart,
  Settings,
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
} from "@/components/ui/sidebar";

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

  return (
    <Sidebar className="border-r border-white/10 bg-[#060606] text-white">
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
      <SidebarContent className="pt-6">
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
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-muted-foreground group-hover:text-white'}`} />
                        <span className={`font-medium font-sans ${isActive ? 'text-primary' : ''}`}>
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
    </Sidebar>
  );
}