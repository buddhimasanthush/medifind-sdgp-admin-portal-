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
import PrivacySecurityPage from "@/pages/privacy-security";
import NotificationsPage from "@/pages/notifications";
import HelpSupportPage from "@/pages/help-support";
import EditProfilePage from "@/pages/edit-profile";
import { customFetch } from "../../../lib/api-client-react/src/custom-fetch";

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
      try {
        return await customFetch("/api/me");
      } catch (err: any) {
        if (err.status === 401) return null;
        throw err;
      }
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
            <Route path="/privacy-security" component={PrivacySecurityPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/help-support" component={HelpSupportPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/profile/edit" component={EditProfilePage} />
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
