import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Shield, BadgeCheck, Clock, IdCard, Save, ChevronLeft, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function EditProfilePage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/me"],
  });

  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // Initialize state when user data is available
  useState(() => {
    if (user) {
      setUsername(user.username);
      setEmployeeId(user.employeeId);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    toast({
      title: "Profile Updated",
      description: "Your administrator profile has been updated successfully.",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    setTimeout(() => setLocation("/profile"), 1000);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button 
            variant="link" 
            onClick={() => setLocation("/profile")} 
            className="w-fit p-0 h-auto text-primary text-xs font-bold uppercase tracking-tight flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Edit Profile
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Update your administrator account identity and system credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl">
        {/* Profile Identity Sidebar */}
        <Card className="lg:col-span-4 border-border/50 shadow-sm overflow-hidden bg-background">
          <CardContent className="pt-10 flex flex-col items-center">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-primary/10 p-1 mb-6 transition-transform group-hover:scale-105 duration-300">
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-display font-bold uppercase">
                  {user.username.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-6 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground border-4 border-background flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-display font-bold text-foreground mb-1">{user.username}</h3>
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-tighter font-bold opacity-60">
              System Admin #{user.id}
            </p>
            
            <div className="w-full h-px bg-border/50 mb-6" />
            
            <div className="w-full space-y-4 px-2">
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-tight mb-2">
                  <BadgeCheck className="w-3 h-4 text-emerald-500" /> Account Status
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground capitalize">{user.status}</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0 px-2 rounded-full uppercase font-black">Verified</Badge>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-tight mb-2">
                  <Clock className="w-3 h-4 text-blue-500" /> Session Expiry
                </div>
                <p className="text-sm font-bold text-foreground">24:00 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Main */}
        <Card className="lg:col-span-8 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Primary Credentials
            </CardTitle>
            <CardDescription>Changes here will affect your system wide identity.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-black text-muted-foreground tracking-tight ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input 
                      className="pl-11 h-12 bg-muted/20 border-border/50 focus:border-primary/50 text-sm font-bold rounded-xl"
                      value={username || user.username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Unique handle for admin identification.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-black text-muted-foreground tracking-tight ml-1">Employee ID</label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input 
                      className="pl-11 h-12 bg-muted/20 border-border/50 focus:border-primary/50 text-sm font-mono font-bold rounded-xl"
                      value={employeeId || user.employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Internal HR identification code.</p>
                </div>
              </div>

              <div className="h-px w-full bg-border/50 my-6" />

              <div className="space-y-4">
                <h4 className="text-xs uppercase font-black text-muted-foreground tracking-tight flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Associated Email
                </h4>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{user.username}@medifind.admin</p>
                    <p className="text-[10px] text-muted-foreground opacity-70">Used for system alerts and critical logging.</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black uppercase text-primary/70 border-primary/20 bg-background/50">Read Only</Badge>
                </div>
              </div>

              <div className="p-4 border-2 border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-black text-amber-900 leading-none mb-1">Security Notice</h5>
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">Changing your username might temporarily affect active sessions. Please ensure you have your credentials noted before confirming.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="px-8 h-12 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 group">
                  <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Sync Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
