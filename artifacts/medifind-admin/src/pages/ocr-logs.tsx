import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, FileScan, CheckCircle2, AlertTriangle, AlertCircle, ScanText } from "lucide-react";
import { 
  useListOcrLogs, 
  type ListOcrLogsStatus,
  OcrLogStatus
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  const [statusFilter, setStatusFilter] = useState<ListOcrLogsStatus | "all">("all");
  
  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: logs, isLoading } = useListOcrLogs(queryParams);

  const totalScans = logs?.length || 0;
  const successScans = logs?.filter(l => l.status === OcrLogStatus.success).length || 0;
  const fallbackScans = logs?.filter(l => l.status === OcrLogStatus.manual_fallback).length || 0;
  const failedScans = logs?.filter(l => l.status === OcrLogStatus.failed).length || 0;

  const successRate = totalScans > 0 ? Math.round((successScans / totalScans) * 100) : 0;

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
        <Card className="hover-elevate transition-all border-border/50 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overall Success Rate</CardTitle>
            <ScanText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary mb-2">{successRate}%</div>
                <Progress value={successRate} className="h-2" />
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Automated Success</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{isLoading ? <Skeleton className="h-8 w-16" /> : successScans}</div>
            <p className="text-xs text-muted-foreground mt-1">High confidence extractions</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-border/50 border-l-4 border-l-amber-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Manual Fallback</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{isLoading ? <Skeleton className="h-8 w-16" /> : fallbackScans}</div>
            <p className="text-xs text-muted-foreground mt-1">Required pharmacist review</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed Scans</CardTitle>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{isLoading ? <Skeleton className="h-8 w-16" /> : failedScans}</div>
            <p className="text-xs text-muted-foreground mt-1">Unreadable documents</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Rx ID, medication, or pharmacy..." 
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
                <SelectItem value={OcrLogStatus.success}>Success</SelectItem>
                <SelectItem value={OcrLogStatus.manual_fallback}>Manual Fallback</SelectItem>
                <SelectItem value={OcrLogStatus.failed}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Rx ID</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Pharmacy & Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">AI Confidence</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full max-w-[120px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileScan className="w-8 h-8 text-muted-foreground/40" />
                      <p>No OCR logs found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="font-mono text-sm text-foreground">
                      {log.prescriptionId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.medicationName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.pharmacyName}</div>
                      <div className="text-xs text-muted-foreground">Pt: {log.patientName}</div>
                    </TableCell>
                    <TableCell>
                      {log.status === OcrLogStatus.success && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Success</Badge>
                      )}
                      {log.status === OcrLogStatus.manual_fallback && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Manual Fallback</Badge>
                      )}
                      {log.status === OcrLogStatus.failed && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">{log.confidence}%</span>
                        </div>
                        <Progress 
                          value={log.confidence} 
                          className={`h-1.5 ${
                            log.confidence > 90 ? '[&>div]:bg-emerald-500' : 
                            log.confidence > 70 ? '[&>div]:bg-amber-500' : 
                            '[&>div]:bg-rose-500'
                          }`} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.scannedAt), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.errorReason ? (
                        <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                          {log.errorReason}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
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
