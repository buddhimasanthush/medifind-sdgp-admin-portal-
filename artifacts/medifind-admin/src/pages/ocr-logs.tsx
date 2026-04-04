import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, FileScan, CheckCircle2, AlertTriangle, AlertCircle, ScanText, User, Timer } from "lucide-react";
import { 
  useListOcrLogs, 
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OcrLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  
  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: logs, isLoading } = useListOcrLogs(queryParams);

  const totalScans = logs?.length || 0;
  const successScans = logs?.filter(l => l.status === "success").length || 0;
  const fallbackScans = logs?.filter(l => l.status === "manual_fallback").length || 0;
  const failedScans = logs?.filter(l => l.status === "failed").length || 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <FileScan className="w-8 h-8 text-primary" />
          AI/OCR Scan Logs
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Monitor the performance of the Medifind prescription scanning AI. Fallbacks indicate manual pharmacist intervention was required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <ScanText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalScans}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{isLoading ? <Skeleton className="h-8 w-16" /> : successScans}</div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Manual Fallback</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{isLoading ? <Skeleton className="h-8 w-16" /> : fallbackScans}</div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{isLoading ? <Skeleton className="h-8 w-16" /> : failedScans}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or Status..." 
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select 
              value={statusFilter} 
              onValueChange={(val: any) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scans</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="manual_fallback">Manual Fallback</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Scan ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full max-w-[120px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileScan className="w-8 h-8 text-muted-foreground/40" />
                      <p>No OCR logs found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="font-mono text-[11px] text-foreground">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]" title={log.userId}>{log.userId || "Anonymous"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.status === "success" && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Success</Badge>
                      )}
                      {log.status === "manual_fallback" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Manual Fallback</Badge>
                      )}
                      {log.status === "failed" && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20">Failed</Badge>
                      )}
                      {!["success", "manual_fallback", "failed"].includes(log.status || "") && (
                        <Badge variant="outline" className="capitalize">{log.status || "Unknown"}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{log.processingTimeMs ? `${log.processingTimeMs}ms` : "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm a') : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
