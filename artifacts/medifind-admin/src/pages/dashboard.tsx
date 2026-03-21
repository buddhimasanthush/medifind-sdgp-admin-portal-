import { useDashboardData } from "@/hooks/use-dashboard-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const revenueData = [
  { name: "Jan", revenue: 180000 },
  { name: "Feb", revenue: 195000 },
  { name: "Mar", revenue: 210000 },
  { name: "Apr", revenue: 205000 },
  { name: "May", revenue: 230000 },
  { name: "Jun", revenue: 245000 },
  { name: "Jul", revenue: 240000 },
  { name: "Aug", revenue: 260000 },
  { name: "Sep", revenue: 275000 },
  { name: "Oct", revenue: 290000 },
  { name: "Nov", revenue: 305000 },
  { name: "Dec", revenue: 310000 },
];

export default function Dashboard() {
  const { approvals, approvePharmacy, rejectPharmacy, recentScans, stats, isLoading } = useDashboardData();
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  // Use real metrics from backend stats
  const totalRevenue = stats?.totalRevenue || 0;
  const activePatientsCount = stats?.activePatients || 0;
  const ocrSuccessRate = stats?.ocrSuccessRate !== undefined ? `${stats.ocrSuccessRate.toFixed(1)}%` : "0.0%";
  const processedRevenueData = stats?.revenueChart || [];

  return (
    <div className="pb-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
        
        {/* ROW 1 */}
        <div className="xl:col-span-2 bg-gradient-to-br from-primary/20 via-card to-card border border-white/10 rounded-3xl p-6 flex flex-col justify-center backdrop-blur-md relative overflow-hidden group min-h-[140px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <h2 className="text-3xl font-display font-bold text-white mb-2 relative z-10">Welcome back, Admin 👋</h2>
          <p className="text-muted-foreground relative z-10">{today}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-muted-foreground font-display">Total Revenue</p>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-primary font-mono-data font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-success mt-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono-data">+12.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-muted-foreground font-display">Active Patients</p>
            <div className="p-2 bg-white/5 rounded-full text-foreground">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl text-white font-mono-data font-bold">{activePatientsCount}</span>
            <div className="flex items-center gap-1 text-success mt-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono-data">+8.2%</span>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-muted-foreground font-display">Pending Pharmacies</p>
            <div className="w-3 h-3 rounded-full bg-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)] mt-1"></div>
          </div>
          <div>
            <span className="text-3xl text-white font-mono-data font-bold">{approvals.length}</span>
            <div className="mt-2">
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-sans">
                Needs Review
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-muted-foreground font-display">AI OCR Success</p>
            <div className="p-2 bg-success/10 rounded-full text-success">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl text-success font-mono-data font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{ocrSuccessRate}</span>
            <div className="mt-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-sans">
                Above Target 94%
              </Badge>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col min-h-[320px]">
          <h3 className="text-lg font-display text-white mb-6">Revenue Growth</h3>
          <div className="flex-1 w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedRevenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 8px 16px -4px rgb(0 0 0 / 0.5)",
                    fontFamily: "var(--font-mono)"
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display text-white">Recent AI Scans</h3>
            <Badge variant="outline" className="border-white/10 text-muted-foreground font-mono-data">Live</Badge>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${scan.status === "Success" ? "bg-success shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-warning shadow-[0_0_5px_rgba(245,158,11,0.8)]"}`} />
                    <span className="text-sm font-mono-data text-white uppercase">{scan.id}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono-data">{scan.timestamp}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{scan.prescriptionName}</p>
                  <p className="text-xs text-muted-foreground truncate">{scan.pharmacyName}</p>
                </div>
                <div className="mt-1">
                  <Badge variant="outline" className={`text-xs px-2 py-0 h-5 font-sans ${scan.status === "Success" ? "border-success/30 text-success bg-success/10" : "border-warning/30 text-warning bg-warning/10"}`}>
                    {scan.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col min-h-[400px] overflow-hidden">
          <h3 className="text-lg font-display text-white mb-6">Pending Pharmacy Approvals</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground font-display border-b border-white/10">
                <tr>
                  <th className="pb-3 px-4 font-medium">Pharmacy Name</th>
                  <th className="pb-3 px-4 font-medium">Registration No.</th>
                  <th className="pb-3 px-4 font-medium">Location</th>
                  <th className="pb-3 px-4 font-medium">Date Applied</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No pending approvals at this time.
                    </td>
                  </tr>
                ) : (
                  approvals.map((pharmacy, i) => (
                    <tr key={pharmacy.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="py-4 px-4 font-medium text-white">{pharmacy.name}</td>
                      <td className="py-4 px-4 font-mono-data text-muted-foreground">{pharmacy.registrationNumber}</td>
                      <td className="py-4 px-4 text-muted-foreground">{pharmacy.location}</td>
                      <td className="py-4 px-4 font-mono-data text-muted-foreground">{pharmacy.dateApplied}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 px-4 border-success/30 text-success hover:bg-success hover:text-success-foreground bg-success/10"
                            onClick={() => approvePharmacy(pharmacy.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 px-4 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-destructive/10"
                            onClick={() => rejectPharmacy(pharmacy.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}