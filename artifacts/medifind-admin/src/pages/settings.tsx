import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, Save, AlertOctagon, ServerCog, Cpu } from "lucide-react";
import { 
  useGetSettings, 
  useUpdateSettings,
  getGetSettingsQueryKey 
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const settingsSchema = z.object({
  platformName: z.string().min(2, "Platform name is required"),
  supportEmail: z.string().email("Invalid email address"),
  ocrConfidenceThreshold: z.number().min(50).max(100),
  autoApprovePharmacies: z.boolean(),
  maxPrescriptionsPerDay: z.coerce.number().min(100),
  maintenanceMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformName: "",
      supportEmail: "",
      ocrConfidenceThreshold: 90,
      autoApprovePharmacies: false,
      maxPrescriptionsPerDay: 5000,
      maintenanceMode: false,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        ocrConfidenceThreshold: settings.ocrConfidenceThreshold,
        autoApprovePharmacies: settings.autoApprovePharmacies,
        maxPrescriptionsPerDay: settings.maxPrescriptionsPerDay,
        maintenanceMode: settings.maintenanceMode,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    updateSettingsMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "Platform configuration has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "There was an error saving the settings.",
        });
      }
    });
  };

  const isMaintenanceMode = form.watch("maintenanceMode");

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Platform Settings
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Manage core Medifind platform configurations, AI tolerances, and system-wide modes.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          
          {/* General Settings */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ServerCog className="w-5 h-5 text-primary" />
                General Settings
              </CardTitle>
              <CardDescription>Core identifiers and support configurations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="platformName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI & Platform Rules */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-primary" />
                AI & Automations
              </CardTitle>
              <CardDescription>Adjust OCR parsing rules and automated approvals.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <FormField
                control={form.control}
                name="ocrConfidenceThreshold"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-base">OCR Success Threshold</FormLabel>
                      <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                        {field.value}%
                      </span>
                    </div>
                    <FormDescription className="mb-4">
                      Prescription scans below this confidence level will be flagged as "Manual Fallback" and require pharmacist intervention.
                    </FormDescription>
                    <FormControl>
                      <Slider
                        min={50}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-px w-full bg-border/50" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="autoApprovePharmacies"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm bg-background">
                      <div className="space-y-1 mr-4">
                        <FormLabel className="text-base">Auto-Approve Pharmacies</FormLabel>
                        <FormDescription className="text-xs">
                          Automatically approve verified registrations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxPrescriptionsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max System Capacity (Rx/Day)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono" />
                      </FormControl>
                      <FormDescription>Global rate limit for processing</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className={`border-2 shadow-sm transition-colors ${isMaintenanceMode ? 'border-rose-500/50 bg-rose-50/30' : 'border-border/50'}`}>
            <CardHeader className={`border-b ${isMaintenanceMode ? 'border-rose-500/20 bg-rose-50/50' : 'bg-muted/10 border-border/50'}`}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertOctagon className={`w-5 h-5 ${isMaintenanceMode ? 'text-rose-500' : 'text-muted-foreground'}`} />
                System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isMaintenanceMode && (
                <Alert variant="destructive" className="mb-6 bg-rose-50 border-rose-200 text-rose-800">
                  <AlertOctagon className="h-4 w-4" color="currentColor" />
                  <AlertTitle>Maintenance Mode Active</AlertTitle>
                  <AlertDescription>
                    The platform is currently in maintenance mode. Non-admin users cannot access the dashboard or submit new prescriptions.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm bg-background">
                    <div className="space-y-1 mr-4">
                      <FormLabel className="text-base text-foreground font-semibold">Enable Maintenance Mode</FormLabel>
                      <FormDescription>
                        Lock the system down for database migrations or critical updates.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-rose-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 sticky bottom-6 z-10">
            <div className="bg-card/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-border/50 flex items-center gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Unsaved changes will be lost if you leave the page.
              </p>
              <Button 
                type="submit" 
                size="lg"
                disabled={updateSettingsMutation.isPending || !form.formState.isDirty} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 px-8 rounded-full font-semibold min-w-[160px]"
              >
                {updateSettingsMutation.isPending ? (
                  "Saving Configuration..."
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
