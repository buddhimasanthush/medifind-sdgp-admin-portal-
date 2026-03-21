import { useLocation } from "wouter";
import { Building2, Users, FileScan, ShoppingCart, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, any> = {
  "/pharmacies": Building2,
  "/patients": Users,
  "/logs": FileScan,
  "/orders": ShoppingCart,
  "/settings": Settings,
};

const TITLE_MAP: Record<string, string> = {
  "/pharmacies": "Pharmacy Directory",
  "/patients": "Patient Management",
  "/logs": "System Logs",
  "/orders": "Orders & Fulfillment",
  "/settings": "Platform Settings",
};

export default function Placeholder() {
  const [location, setLocation] = useLocation();
  
  const Icon = ICON_MAP[location] || Settings;
  const title = TITLE_MAP[location] || "Page Not Found";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        This section is currently under development. Check back later for comprehensive tools to manage your {title.toLowerCase()}.
      </p>
      <Button 
        onClick={() => setLocation("/")}
        className="rounded-full px-6 shadow-md shadow-primary/20"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Dashboard
      </Button>
    </div>
  );
}
