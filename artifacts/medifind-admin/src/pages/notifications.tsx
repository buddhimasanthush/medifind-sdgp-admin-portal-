import { useState } from "react";
import { Bell, BellOff, CheckCircle2, Truck, CreditCard, AlarmClock, Tag, Trash2, Mail, Smartphone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Notif {
  id: number;
  icon: any;
  color: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export default function NotificationsPage() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const { toast } = useToast();

  const [notifs, setNotifs] = useState<Notif[]>([
    {
      id: 1,
      icon: <Truck className="w-5 h-5" />,
      color: "text-blue-500 bg-blue-500/10",
      title: "Order Delivered!",
      body: "Your order from Health Link has been delivered successfully.",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-emerald-500 bg-emerald-500/10",
      title: "Payment Confirmed",
      body: "RS.5150 payment for Asiri Hospital was successful.",
      time: "1 hr ago",
      unread: true,
    },
    {
      id: 3,
      icon: <AlarmClock className="w-5 h-5" />,
      color: "text-amber-500 bg-amber-500/10",
      title: "Medicine Reminder",
      body: "Time to take your Paracetamol 500mg.",
      time: "3 hr ago",
      unread: false,
    },
    {
      id: 4,
      icon: <Tag className="w-5 h-5" />,
      color: "text-purple-500 bg-purple-500/10",
      title: "Special Offer",
      body: "Get 10% off on your next order from Union Chemists.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 5,
      icon: <Truck className="w-5 h-5" />,
      color: "text-blue-500 bg-blue-500/10",
      title: "Order Shipped",
      body: "Your order #MF391977 is on the way.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 6,
      icon: <AlarmClock className="w-5 h-5" />,
      color: "text-amber-500 bg-amber-500/10",
      title: "Medicine Reminder",
      body: "Time to take your Amoxicillin 250mg.",
      time: "2 days ago",
      unread: false,
    },
  ]);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
    toast({ description: "All notifications marked as read." });
  };

  const clearAll = () => {
    setNotifs([]);
    toast({ description: "Notification log cleared." });
  };

  const removeNotif = (id: number) => {
    setNotifs(notifs.filter((n) => n.id !== id));
  };

  const toggleRead = (id: number) => {
    setNotifs(notifs.map((n) => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
            {unreadCount > 0 && <Badge variant="destructive" className="ml-2 px-2 py-0.5 rounded-full">{unreadCount}</Badge>}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Stay up to date with order statuses, system alerts, and pharmacy updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="h-9 px-4 rounded-full border-primary/20 hover:bg-primary/5 text-primary">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
          {notifs.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 px-4 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5">
              <Trash2 className="w-4 h-4 mr-2" /> Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Notifications List */}
        <Card className="lg:col-span-12 border-border/50 shadow-sm overflow-hidden bg-background">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-lg font-display">Recent History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifs.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-center opacity-40">
                <BellOff className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">No notifications</h3>
                <p>Everything is up to date.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifs.map((n) => (
                  <div key={n.id} className={`p-4 sm:p-6 flex items-start gap-4 transition-colors hover:bg-muted/10 group ${n.unread ? "bg-primary/5 relative" : ""}`}>
                    {n.unread && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
                    
                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${n.color}`}>
                      {n.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm tracking-tight truncate ${n.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-70 tracking-tighter shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pr-8 line-clamp-2">{n.body}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => toggleRead(n.id)}>
                        <CheckCircle2 className={`h-4 w-4 ${n.unread ? "text-primary" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => removeNotif(n.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Delivery & Alerts Status */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-primary shadow-sm text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider font-bold opacity-80">Delivery Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tighter">Active</h3>
                  <p className="text-xs opacity-70">Push notifications enabled</p>
                </div>
                <Truck className="w-10 h-10 opacity-30" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-amber-500 shadow-sm text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider font-bold opacity-80">Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tighter">Enabled</h3>
                  <p className="text-xs opacity-70">Daily dosage schedules</p>
                </div>
                <AlarmClock className="w-10 h-10 opacity-30" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-emerald-500 shadow-sm text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider font-bold opacity-80">System Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tighter">Healthy</h3>
                  <p className="text-xs opacity-70">Email & SMS gateways online</p>
                </div>
                <Smartphone className="w-10 h-10 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Column 1 */}
        <Card className="lg:col-span-6 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Bell className="w-4 h-4 text-primary" /> Application Triggers
            </CardTitle>
            <CardDescription className="text-xs tracking-tight">Push notification sources</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <ToggleRow title="Order Updates" sub="Delivery status & confirmations" icon={<Truck className="w-4 h-4" />} enabled={orderUpdates} onToggle={setOrderUpdates} />
              <ToggleRow title="Medicine Reminders" sub="Daily dosage alerts" icon={<AlarmClock className="w-4 h-4" />} enabled={reminderAlerts} onToggle={setReminderAlerts} />
              <ToggleRow title="Promotions & Offers" sub="Discounts from pharmacies" icon={<Tag className="w-4 h-4" />} enabled={promotions} onToggle={setPromotions} />
              <ToggleRow title="System Updates" sub="New features & maintenance" icon={<Info className="w-4 h-4" />} enabled={appUpdates} onToggle={setAppUpdates} />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Column 2 */}
        <Card className="lg:col-span-6 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Smartphone className="w-4 h-4 text-primary" /> Channel Channels
            </CardTitle>
            <CardDescription className="text-xs tracking-tight">Delivery methods and gateways</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <ToggleRow title="Email Notifications" sub="Summaries and receipts via email" icon={<Mail className="w-4 h-4" />} enabled={emailNotifs} onToggle={setEmailNotifs} />
              <ToggleRow title="SMS Notifications" sub="Urgent alerts delivered to phone" icon={<Smartphone className="w-4 h-4" />} enabled={smsNotifs} onToggle={setSmsNotifs} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ title, sub, icon, enabled, onToggle }: any) {
  return (
    <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-foreground leading-none mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{sub}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} className="data-[state=checked]:bg-primary" />
    </div>
  );
}
