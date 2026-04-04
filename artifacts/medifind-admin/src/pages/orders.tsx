import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Filter, ShoppingCart, Package, Truck, CheckCircle, XCircle, Store, User, FileText, MapPin } from "lucide-react";
import { 
  useListOrders, 
  useUpdateOrderStatus,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
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

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: orders, isLoading } = useListOrders(queryParams);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({
      id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({
          title: "Order Updated",
          description: "Order status has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update order status.",
        });
      }
    });
  };

  const totalOrders = orders?.length || 0;
  const processingOrders = orders?.filter(o => o.status === "processing").length || 0;
  const shippedOrders = orders?.filter(o => o.status === "shipped").length || 0;
  const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Orders & Fulfillment
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Track prescription fulfillment and manage delivery statuses across the Medifind network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? <Skeleton className="h-8 w-16" /> : processingOrders}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{isLoading ? <Skeleton className="h-8 w-16" /> : shippedOrders}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{isLoading ? <Skeleton className="h-8 w-16" /> : deliveredOrders}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Order ID or Status..." 
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
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Order ID & Date</TableHead>
                <TableHead>User & Pharmacy</TableHead>
                <TableHead>Prescription</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-primary uppercase">
                          {order.id.split('-')[0]}...
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]" title={order.userId}>{order.userId}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Store className="w-3 h-3" />
                          <span className="truncate max-w-[150px]" title={order.pharmacyId}>{order.pharmacyId}</span>
                        </div>
                        {order.deliveryAddressId && (
                           <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5">
                           <MapPin className="w-2.5 h-2.5" />
                           <span className="truncate max-w-[150px]">Address ID: {order.deliveryAddressId.split('-')[0]}</span>
                         </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.prescriptionUrl ? (
                         <a 
                         href={order.prescriptionUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                       >
                         <FileText className="w-3 h-3" />
                         View Script
                       </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No prescription</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {order.totalPrice ? `$${Number(order.totalPrice).toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell>
                      {order.status === "processing" && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 whitespace-nowrap"><Package className="w-3 h-3 mr-1"/> Processing</Badge>
                      )}
                      {order.status === "shipped" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 whitespace-nowrap"><Truck className="w-3 h-3 mr-1"/> Shipped</Badge>
                      )}
                      {order.status === "delivered" && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 whitespace-nowrap"><CheckCircle className="w-3 h-3 mr-1"/> Delivered</Badge>
                      )}
                      {order.status === "cancelled" && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20 whitespace-nowrap"><XCircle className="w-3 h-3 mr-1"/> Cancelled</Badge>
                      )}
                      {!["processing", "shipped", "delivered", "cancelled"].includes(order.status || "") && (
                        <Badge variant="outline" className="bg-muted text-muted-foreground uppercase text-[10px]">{order.status || "Unknown"}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={order.status || "processing"}
                        onValueChange={(val) => handleUpdateStatus(order.id, val)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="h-8 text-[11px] bg-background">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
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
