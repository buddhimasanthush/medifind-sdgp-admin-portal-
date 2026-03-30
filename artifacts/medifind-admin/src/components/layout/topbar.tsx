import { Search, Bell, ChevronDown, Check, X, UserPlus, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { customFetch } from "../../../../../lib/api-client-react/src/custom-fetch";

export type Admin = {
  id: number;
  username: string;
  employeeId: string;
  status: string;
};

export function TopBar({ title = "Dashboard" }: { title?: string }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery<Admin>({
    queryKey: ["/api/me"],
    enabled: false,
  });

  const handleLogout = async () => {
    console.log('1️⃣ Logout clicked');
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) {
      console.log('❌ Cancelled');
      return;
    }
    console.log('2️⃣ Calling backend logout');
    try {
      const res = await fetch(
        `${(import.meta as any).env.VITE_API_URL || ''}/api/logout`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      console.log('3️⃣ Backend response status:', res.status);
    } catch (err) {
      console.error('3️⃣ Backend logout failed:', err);
    }
    console.log('4️⃣ Clearing all caches and storage');
    queryClient.clear();
    queryClient.removeQueries();
    queryClient.setQueryData(['/api/me'], null);
    localStorage.clear();
    sessionStorage.clear();
    console.log('5️⃣ Cache cleared. /api/me data:', queryClient.getQueryData(['/api/me']));
    const base = (import.meta as any).env.BASE_URL || '/medifind-sdgp-admin-portal-/';
    const redirectUrl = window.location.origin + base;
    console.log('6️⃣ Hard redirecting to:', redirectUrl);
    window.location.replace(redirectUrl);
  };

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      return await customFetch<any[]>("/api/notifications");
    },
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await customFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ adminId, action }: { adminId: number; action: string }) => {
      return await customFetch<any>("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, action }),
      });
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden text-foreground" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
        <h1 className="text-xl font-display font-semibold text-foreground hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pharmacies, patients, or orders..."
            className="w-full pl-9 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus-visible:bg-muted/80 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary rounded-full h-10 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu onOpenChange={(open) => {
            if (!open && unreadCount > 0) {
              // Mark all as read when closing the dropdown?
              // Or better, mark individual ones.
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] p-0 rounded-2xl border-muted bg-card shadow-2xl">
              <DropdownMenuLabel className="p-4 flex items-center justify-between">
                <span className="font-display font-semibold">Notifications</span>
                {unreadCount > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{unreadCount} New</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50" />
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 opacity-20" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => {
                      const metadata = n.metadata ? JSON.parse(n.metadata) : {};
                      return (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-muted/30 transition-colors hover:bg-muted/20 ${!n.read ? 'bg-primary/5' : ''}`}
                          onClick={() => !n.read && markReadMutation.mutate(n.id)}
                        >
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {n.type === 'new_employee_signup' ? (
                                <div className="p-2 bg-primary/10 rounded-full">
                                  <UserPlus className="w-4 h-4 text-primary" />
                                </div>
                              ) : (
                                <div className="p-2 bg-muted rounded-full">
                                  <Bell className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>

                              {n.type === 'new_employee_signup' && !n.read && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      approveMutation.mutate({ adminId: metadata.adminId, action: 'approved' });
                                      markReadMutation.mutate(n.id);
                                    }}
                                  >
                                    <Check className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3 text-xs border-muted text-muted-foreground hover:text-foreground rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      approveMutation.mutate({ adminId: metadata.adminId, action: 'rejected' });
                                      markReadMutation.mutate(n.id);
                                    }}
                                  >
                                    <X className="w-3 h-3 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem className="p-3 text-center justify-center text-xs text-primary font-medium focus:bg-primary/10 cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-8 w-px bg-muted mx-1 hidden sm:block" />

        {/* User dropdown with Profile + Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-muted p-1.5 pr-3 rounded-full transition-colors group text-left">
              <Avatar className="w-8 h-8 border border-muted group-hover:border-primary transition-colors">
                <AvatarFallback className="bg-primary/20 text-primary font-medium text-sm font-display uppercase">
                  {user?.username?.substring(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 hidden sm:flex">
                <span className="text-sm font-medium text-foreground font-display">
                  {user?.username || "Admin Profile"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-muted bg-card shadow-2xl p-1">
            <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground font-sans truncate">
              {user?.username || "Admin"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-xl">
                <User className="w-4 h-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-400/10 cursor-pointer rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}