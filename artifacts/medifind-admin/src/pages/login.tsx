import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../../../lib/api-client-react/src/custom-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, UserPlus, FileBadge } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password, employeeId }),
      });
    },
    onSuccess: (data: any) => {
      if (data.status === "pending") {
        toast({ 
          title: "Account pending", 
          description: "Your account is created but waiting for admin approval.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        toast({ title: "Account created!", description: "Successfully registered and logged in." });
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl animate-in fade-in zoom-in duration-500 z-10">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Medifind Admin</CardTitle>
          <CardDescription className="text-zinc-400">
            Secure access to the Medifind platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-in slide-in-from-left-2 duration-300">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-login" className="text-zinc-300">Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="username-login"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login" className="text-zinc-300">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="password-login"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in slide-in-from-right-2 duration-300">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-id" className="text-zinc-300">Employee ID</Label>
                  <div className="relative">
                    <FileBadge className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="employee-id"
                      placeholder="MF-1001"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary uppercase"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username-register" className="text-zinc-300">Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="username-register"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register" className="text-zinc-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="password-register"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" />Create Admin Account</>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-zinc-800 mt-4 pt-6 text-center">
          <p className="text-sm text-zinc-500">
            Internal Medifind Portal. Secured locally.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
