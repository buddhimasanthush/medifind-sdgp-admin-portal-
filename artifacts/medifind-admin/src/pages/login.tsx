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
import { Loader2, Mail, Lock, LogIn, FileBadge, ArrowLeft, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  
  // Steps: 1 = email, 2 = otp
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // --- LOGIN MUTATIONS ---
  const loginRequestOtpMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/login/request-otp", {
        method: "POST",
        body: JSON.stringify({ username }),
      });
    },
    onSuccess: () => {
      toast({ title: "OTP Sent", description: "Check your email (or terminal console) for the code." });
      setLoginStep(2);
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  const loginVerifyOtpMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/login/verify-otp", {
        method: "POST",
        body: JSON.stringify({ username, otp }),
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

  // --- REGISTER MUTATIONS ---
  const registerRequestOtpMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/register/request-otp", {
        method: "POST",
        body: JSON.stringify({ username, employeeId }),
      });
    },
    onSuccess: () => {
      toast({ title: "OTP Sent", description: "Check your email (or terminal console) for the code." });
      setRegisterStep(2);
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  const registerVerifyOtpMutation = useMutation({
    mutationFn: async () => {
      return await customFetch("/api/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ username, otp }),
      });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Account Confirmed", 
        description: data.message || "Your account has been created and is waiting for admin approval.",
      });
      // Reset after success
      setRegisterStep(1);
      setUsername("");
      setEmployeeId("");
      setOtp("");
      // Switch back to login tab ideally, but for now just clear
      document.getElementById('tab-login')?.click();
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStep === 1) {
      loginRequestOtpMutation.mutate();
    } else {
      loginVerifyOtpMutation.mutate();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerStep === 1) {
      registerRequestOtpMutation.mutate();
    } else {
      registerVerifyOtpMutation.mutate();
    }
  };

  const resetSteps = () => {
    setLoginStep(1);
    setRegisterStep(1);
    setOtp("");
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
            Secure access via Email OTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={resetSteps}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-900 border border-zinc-800">
              <TabsTrigger id="tab-login" value="login" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-in slide-in-from-left-2 duration-300">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginStep === 1 ? (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="username-login" className="text-zinc-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          id="username-login"
                          type="email"
                          placeholder="admin@example.com"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 bg-primary hover:bg-primary/90" 
                      disabled={loginRequestOtpMutation.isPending}
                    >
                      {loginRequestOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Lock className="mr-2 h-4 w-4" /> Send OTP</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <Button type="button" variant="ghost" className="p-0 h-auto text-zinc-400 hover:text-white mb-2 font-normal flex items-center text-sm" onClick={() => setLoginStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back to Email
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="otp-login" className="text-zinc-300">6-Digit OTP</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          id="otp-login"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary tracking-widest font-mono text-center"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                      disabled={loginVerifyOtpMutation.isPending}
                    >
                      {loginVerifyOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in slide-in-from-right-2 duration-300">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {registerStep === 1 ? (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
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
                      <Label htmlFor="username-register" className="text-zinc-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          id="username-register"
                          type="email"
                          placeholder="admin@example.com"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                      disabled={registerRequestOtpMutation.isPending}
                    >
                      {registerRequestOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Lock className="mr-2 h-4 w-4" /> Send Verification Code</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <Button type="button" variant="ghost" className="p-0 h-auto text-zinc-400 hover:text-white mb-2 font-normal flex items-center text-sm" onClick={() => setRegisterStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back to details
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="otp-register" className="text-zinc-300">Verification Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input
                          id="otp-register"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary tracking-widest font-mono text-center"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                      disabled={registerVerifyOtpMutation.isPending}
                    >
                      {registerVerifyOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Code & Confirm Account"}
                    </Button>
                  </div>
                )}
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
