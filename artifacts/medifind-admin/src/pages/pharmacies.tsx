import { useState } from "react";
import { format } from "date-fns";
import { Search, Building2, Phone, MapPin, Globe, Clock as ClockIcon } from "lucide-react";
import { 
  useListPharmacies,
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Manual icons if lucide-material-react is not available or has different names
import { 
  Store,
  Calendar,
} from "lucide-react";

export default function PharmaciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const queryParams = {
    search: debouncedSearch || undefined,
  };

  const { data: pharmacies, isLoading } = useListPharmacies(queryParams);

  const totalPharmacies = pharmacies?.length || 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Pharmacy Directory
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Manage your network of healthcare providers and view detailed pharmacy information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalPharmacies}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or address..." 
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Pharmacy Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>External Info</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full max-w-[120px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pharmacies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Store className="w-8 h-8 text-muted-foreground/40" />
                      <p>No pharmacies found matching your search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pharmacies?.map((pharmacy) => (
                  <TableRow key={pharmacy.id} className="group transition-colors hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{pharmacy.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground mt-1 truncate max-w-[150px]" title={pharmacy.id}>
                          {pharmacy.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-[250px]">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />
                        <span className="text-sm leading-tight">{pharmacy.address || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{pharmacy.phone || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[120px]">{pharmacy.openingHours || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {pharmacy.externalUrl ? (
                          <a 
                            href={pharmacy.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No URL</span>
                        )}
                        {pharmacy.externalKey && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 w-fit font-mono font-normal">
                            Key: {pharmacy.externalKey}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">
                          {pharmacy.createdAt ? format(new Date(pharmacy.createdAt), 'MMM d, yyyy') : "N/A"}
                        </span>
                      </div>
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
