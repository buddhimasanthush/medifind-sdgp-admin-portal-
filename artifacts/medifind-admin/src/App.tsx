import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader2 } from "lucide-react";

import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import PharmaciesPage from "@/pages/pharmacies";
import PatientsPage from "@/pages/patients";
import OcrLogsPage from "@/pages/ocr-logs";
import OrdersPage from "@/pages/orders";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && location !== "/login") {
    return <LoginPage />;
  }

  if (user && location === "/login") {
    return <Dashboard />; // Or redirect to /
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="*">
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/pharmacies" component={PharmaciesPage} />
            <Route path="/patients" component={PatientsPage} />
            <Route path="/logs" component={OcrLogsPage} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
