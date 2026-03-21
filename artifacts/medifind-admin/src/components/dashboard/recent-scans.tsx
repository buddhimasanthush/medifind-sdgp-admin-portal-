import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function RecentScans() {
  const { recentScans } = useDashboardData();

  return (
    <Card className="h-full flex flex-col border-border/60 shadow-sm">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display text-foreground">Recent AI Scans</CardTitle>
          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="flex flex-col divide-y divide-border/40">
          {recentScans.map((scan) => (
            <div key={scan.id} className="p-4 hover:bg-muted/30 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-md flex-shrink-0 ${
                    scan.status === "Success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                      {scan.prescriptionName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[160px] sm:max-w-[200px]">
                      {scan.pharmacyName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge 
                    variant={scan.status === "Success" ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {scan.status}
                  </Badge>
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {scan.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
