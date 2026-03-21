import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
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

export function RevenueChart() {
  return (
    <Card className="h-full flex flex-col border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display text-foreground">Monthly Platform Revenue</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
