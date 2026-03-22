import { useState } from "react";
import { Shield, Fingerprint, Lock, Share2, MapPin, Download, Trash2, ChevronRight, Scale, FileText, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PrivacySecurityPage() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const { toast } = useToast();

  const showSnack = (msg: string) => {
    toast({
      description: msg,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Privacy & Security
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Manage your account security and data privacy settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Security Section */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Protect your administrator account access.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <ToggleRow
                title="Two-Factor Authentication"
                sub="Extra layer of account security"
                icon={<Shield className="w-4 h-4" />}
                enabled={twoFactor}
                onToggle={setTwoFactor}
              />
              <ToggleRow
                title="Biometric Login"
                sub="Use Face ID or fingerprint"
                icon={<Fingerprint className="w-4 h-4" />}
                enabled={biometric}
                onToggle={setBiometric}
              />
              <ActionRow
                title="Change Password"
                sub="Update your account password"
                icon={<Lock className="w-4 h-4" />}
                onClick={() => showSnack("Change password coming soon")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Section */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Data & Privacy
            </CardTitle>
            <CardDescription>Control how your data is handled.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <ToggleRow
                title="Data Sharing"
                sub="Share anonymised data to improve services"
                icon={<Share2 className="w-4 h-4" />}
                enabled={dataSharing}
                onToggle={setDataSharing}
              />
              <ToggleRow
                title="Location Access"
                sub="Allow location for nearby pharmacies"
                icon={<MapPin className="w-4 h-4" />}
                enabled={locationAccess}
                onToggle={setLocationAccess}
              />
              <ActionRow
                title="Download My Data"
                sub="Get a copy of your personal data"
                icon={<Download className="w-4 h-4" />}
                onClick={() => showSnack("Data export coming soon")}
              />
              <ActionRow
                title="Delete Account"
                sub="Permanently remove your account"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => showSnack("Delete request sent")}
                isDestructive
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal section */}
        <Card className="border-border/50 shadow-sm overflow-hidden md:col-span-2">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
              <ActionRow
                title="Privacy Policy"
                sub="Read our privacy policy"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => showSnack("Opening privacy policy...")}
              />
              <ActionRow
                title="Terms of Service"
                sub="View terms and conditions"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => showSnack("Opening terms...")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ title, sub, icon, enabled, onToggle }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

function ActionRow({ title, sub, icon, onClick, isDestructive }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors text-left ${
        isDestructive ? "group hover:bg-destructive/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        }`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${isDestructive ? "text-destructive" : "text-foreground"}`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 ${isDestructive ? "text-destructive/50" : "text-muted-foreground/50"}`} />
    </button>
  );
}
