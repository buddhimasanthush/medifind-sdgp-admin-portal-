import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Filter, Store, CheckCircle2, XCircle, Clock, Building2 } from "lucide-react";
import { 
  useListPharmacies, 
  useUpdatePharmacyStatus, 
  getListPharmaciesQueryKey,
  type ListPharmaciesStatus,
  PharmacyStatus
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function PharmaciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<ListPharmaciesStatus | "all">("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: pharmacies, isLoading } = useListPharmacies(queryParams);
  const updateStatusMutation = useUpdatePharmacyStatus();

  const handleUpdateStatus = (id: number, newStatus: typeof PharmacyStatus[keyof typeof PharmacyStatus]) => {
    // Only approved/rejected are valid updates from the API schema for this endpoint
    if (newStatus !== PharmacyStatus.approved && newStatus !== PharmacyStatus.rejected) return;

    updateStatusMutation.mutate({
      id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({
          title: "Status Updated",
          description: `Pharmacy has been ${newStatus}.`,
        });
        queryClient.invalidateQueries({ queryKey: getListPharmaciesQueryKey() });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update pharmacy status.",
        });
      }
    });
  };

  const totalPharmacies = pharmacies?.length || 0;
  const approvedPharmacies = pharmacies?.filter(p => p.status === PharmacyStatus.approved).length || 0;
  const pendingPharmacies = pharmacies?.filter(p => p.status === PharmacyStatus.pending).length || 0;
  const rejectedPharmacies = pharmacies?.filter(p => p.status === PharmacyStatus.rejected).length || 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Pharmacy Directory
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Review pending pharmacy applications and manage your existing network of approved healthcare providers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalPharmacies}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{isLoading ? <Skeleton className="h-8 w-16" /> : approvedPharmacies}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50 border-l-4 border-l-amber-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{isLoading ? <Skeleton className="h-8 w-16" /> : pendingPharmacies}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{isLoading ? <Skeleton className="h-8 w-16" /> : rejectedPharmacies}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or registration number..." 
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PharmacyStatus.pending}>Pending</SelectItem>
                <SelectItem value={PharmacyStatus.approved}>Approved</SelectItem>
                <SelectItem value={PharmacyStatus.rejected}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Pharmacy Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full max-w-[120px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pharmacies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Store className="w-8 h-8 text-muted-foreground/40" />
                      <p>No pharmacies found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pharmacies?.map((pharmacy) => (
                  <TableRow key={pharmacy.id} className="group">
                    <TableCell className="font-medium text-foreground">{pharmacy.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{pharmacy.registrationNumber}</TableCell>
                    <TableCell>{pharmacy.location}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{pharmacy.contactEmail}</div>
                        <div className="text-muted-foreground">{pharmacy.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(pharmacy.dateApplied), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {pharmacy.status === PharmacyStatus.approved && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Approved</Badge>
                      )}
                      {pharmacy.status === PharmacyStatus.pending && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Pending</Badge>
                      )}
                      {pharmacy.status === PharmacyStatus.rejected && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20">Rejected</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {pharmacy.status === PharmacyStatus.pending ? (
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 text-emerald-600 border-emerald-200"
                            onClick={() => handleUpdateStatus(pharmacy.id, PharmacyStatus.approved)}
                            disabled={updateStatusMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 border-rose-200"
                            onClick={() => handleUpdateStatus(pharmacy.id, PharmacyStatus.rejected)}
                            disabled={updateStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </Button>
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
