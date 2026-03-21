import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Building2, MapPin } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useToast } from "@/hooks/use-toast";

export function PendingApprovals() {
  const { approvals, approvePharmacy, rejectPharmacy } = useDashboardData();
  const { toast } = useToast();

  const handleApprove = (id: string, name: string) => {
    approvePharmacy(id);
    toast({
      title: "Pharmacy Approved",
      description: `${name} has been successfully approved and onboarded.`,
      variant: "default",
    });
  };

  const handleReject = (id: string, name: string) => {
    rejectPharmacy(id);
    toast({
      title: "Pharmacy Rejected",
      description: `${name}'s application has been rejected.`,
      variant: "destructive",
    });
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display text-foreground">Pending Pharmacy Approvals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Review and manage new pharmacy registrations.</p>
          </div>
          <div className="bg-warning/10 text-warning text-xs font-semibold px-2.5 py-1 rounded-md border border-warning/20">
            {approvals.length} Pending
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {approvals.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">There are no pending pharmacy approvals at this time. Great job.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold w-[250px]">Pharmacy Name</TableHead>
                <TableHead className="font-semibold">Registration No.</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Date Applied</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((pharmacy) => (
                <TableRow key={pharmacy.id} className="group">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/5 rounded border border-primary/10">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      {pharmacy.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {pharmacy.registrationNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />
                      {pharmacy.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pharmacy.dateApplied}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-success/30 text-success hover:bg-success hover:text-success-foreground"
                        onClick={() => handleApprove(pharmacy.id, pharmacy.name)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleReject(pharmacy.id, pharmacy.name)}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
