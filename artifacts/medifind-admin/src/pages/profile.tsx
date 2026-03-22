import { useQuery } from "@tanstack/react-query";
import { User, Mail, Shield, BadgeCheck, Clock, IdCard, Bell, HelpCircle, UserCog, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/me"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full max-w-2xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Admin Profile
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          View and manage your personal administrator account details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <Card className="lg:col-span-1 border-border/50 shadow-sm overflow-hidden">
          <CardContent className="pt-8 flex flex-col items-center">
            <Avatar className="w-24 h-24 border-2 border-primary/20 p-1 mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display font-bold uppercase">
                {user.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-display font-bold text-foreground mb-1">{user.username}</h3>
            <p className="text-sm text-muted-foreground mb-4">Internal Administrator</p>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-sans px-4 py-1 rounded-full uppercase text-[10px] tracking-wider font-bold">
              {user.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Shield className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-6 border-b sm:border-r border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <IdCard className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-tight">Employee ID</span>
                </div>
                <p className="text-foreground font-mono font-medium">{user.employeeId}</p>
              </div>
              
              <div className="p-6 border-b border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-tight">Member Since</span>
                </div>
                <p className="text-foreground font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="p-6 sm:border-r border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs uppercase font-bold tracking-tight">Account Status</span>
                </div>
                <p className="text-foreground font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </p>
              </div>

              <div className="p-6 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-tight">System Email</span>
                </div>
                <p className="text-foreground font-medium">{user.username}@medifind.admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 max-w-6xl">
        <h3 className="text-xl font-display font-bold text-foreground">Account Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileLink 
            href="/profile/edit" 
            icon={<UserCog className="w-5 h-5" />} 
            title="Edit Identity" 
            sub="Change display name and id" 
          />
          <ProfileLink 
            href="/privacy-security" 
            icon={<Shield className="w-5 h-5" />} 
            title="Privacy & Security" 
            sub="Manage 2FA and sessions" 
          />
          <ProfileLink 
            href="/notifications" 
            icon={<Bell className="w-5 h-5" />} 
            title="Notification Alerts" 
            sub="Config system updates" 
          />
          <ProfileLink 
            href="/help-support" 
            icon={<HelpCircle className="w-5 h-5" />} 
            title="Support & FAQ" 
            sub="Get help with the portal" 
          />
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ href, icon, title, sub }: any) {
  return (
    <Link href={href}>
      <Card className="border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground leading-none mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
