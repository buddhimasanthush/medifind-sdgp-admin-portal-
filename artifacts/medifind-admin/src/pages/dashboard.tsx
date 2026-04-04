import { useDashboardData } from "@/hooks/use-dashboard-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Activity, FileScan } from "lucide-react";

export default function Dashboard() {
  const { recentScans, stats, isLoading } = useDashboardData();
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
            <p className="text-muted-foreground font-display">Health Profiles</p>
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
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-display text-white">Revenue Growth</h3>
             <Badge variant="outline" className="border-white/10 text-muted-foreground font-mono-data">Trailing 12 Months</Badge>
          </div>
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

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-muted-foreground font-display">AI OCR Accuracy</p>
            <div className="p-2 bg-success/10 rounded-full text-success">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl text-success font-mono-data font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{ocrSuccessRate}</span>
            <div className="mt-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-sans">
                Real-time
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display text-white">Recent AI Scans</h3>
            <Badge variant="outline" className="border-white/10 text-muted-foreground font-mono-data">Live Feed</Badge>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {recentScans.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <FileScan className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">No recent scans detected</p>
               </div>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${scan.status === "Success" ? "bg-success shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-warning shadow-[0_0_5px_rgba(245,158,11,0.8)]"}`} />
                      <span className="text-[10px] font-mono-data text-white uppercase italic">{scan.id.split('-')[0]}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono-data">{scan.timestamp}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/90 truncate capitalize">User: {scan.userId?.split('-')[0] || "Anonymous"}</p>
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">Status: {scan.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}