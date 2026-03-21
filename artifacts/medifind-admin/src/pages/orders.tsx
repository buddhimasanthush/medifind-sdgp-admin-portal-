import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Filter, ShoppingCart, Package, Truck, CheckCircle, XCircle, Store } from "lucide-react";
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

type ListOrdersStatus = "processing" | "shipped" | "delivered" | "cancelled";
const OrderStatus = {
  processing: "processing" as const,
  shipped: "shipped" as const,
  delivered: "delivered" as const,
  cancelled: "cancelled" as const,
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<ListOrdersStatus | "all">("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: orders, isLoading } = useListOrders(queryParams);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id,
      data: { status: newStatus as any }
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
  const processingOrders = orders?.filter(o => o.status === OrderStatus.processing).length || 0;
  const shippedOrders = orders?.filter(o => o.status === OrderStatus.shipped).length || 0;
  const deliveredOrders = orders?.filter(o => o.status === OrderStatus.delivered).length || 0;

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
              placeholder="Search by Order ID, Patient, or Pharmacy..." 
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
                <SelectItem value={OrderStatus.processing}>Processing</SelectItem>
                <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Patient & Pharmacy</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="w-[160px]">Update Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{order.patientName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3" />
                        {order.pharmacyName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={order.medications}>
                      {order.medications}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {order.status === OrderStatus.processing && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><Package className="w-3 h-3 mr-1"/> Processing</Badge>
                      )}
                      {order.status === OrderStatus.shipped && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20"><Truck className="w-3 h-3 mr-1"/> Shipped</Badge>
                      )}
                      {order.status === OrderStatus.delivered && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1"/> Delivered</Badge>
                      )}
                      {order.status === OrderStatus.cancelled && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20"><XCircle className="w-3 h-3 mr-1"/> Cancelled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={order.status}
                        onValueChange={(val) => handleUpdateStatus(order.id, val)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={OrderStatus.processing}>Processing</SelectItem>
                          <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                          <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                          <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
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
