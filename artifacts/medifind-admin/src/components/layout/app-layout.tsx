import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./topbar";
import { useLocation } from "wouter";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview Dashboard",
  "/pharmacies": "Pharmacy Management",
  "/patients": "Patient Directory",
  "/logs": "AI System Logs",
  "/orders": "Order Fulfillment",
  "/settings": "Platform Settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const title = PAGE_TITLES[location] || "Dashboard";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar title={title} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
