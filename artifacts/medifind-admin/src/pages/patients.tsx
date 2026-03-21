import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Filter, Users, User, Pencil, FileText, CalendarDays } from "lucide-react";
import { 
  useListPatients, 
  useUpdatePatient, 
  getListPatientsQueryKey,
  type ListPatientsStatus,
  PatientStatus,
  type Patient
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const updatePatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  status: z.enum([PatientStatus.active, PatientStatus.inactive]),
});

type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>;

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<ListPatientsStatus | "all">("all");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: patients, isLoading } = useListPatients(queryParams);
  const updatePatientMutation = useUpdatePatient();

  const form = useForm<UpdatePatientFormValues>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      status: PatientStatus.active,
    },
  });

  const openEditDialog = (patient: Patient) => {
    form.reset({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      status: patient.status,
    });
    setEditingPatient(patient);
  };

  const onUpdateSubmit = (values: UpdatePatientFormValues) => {
    if (!editingPatient) return;
    
    updatePatientMutation.mutate({
      id: editingPatient.id,
      data: values
    }, {
      onSuccess: () => {
        toast({ title: "Patient Updated", description: "The patient record has been saved successfully." });
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setEditingPatient(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Update Failed", description: "There was an error saving the patient." });
      }
    });
  };

  const totalPatients = patients?.length || 0;
  const activePatients = patients?.filter(p => p.status === PatientStatus.active).length || 0;
  const inactivePatients = patients?.filter(p => p.status === PatientStatus.inactive).length || 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Patient Management
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          View and manage patients registered on the Medifind platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalPatients}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? <Skeleton className="h-8 w-16" /> : activePatients}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{isLoading ? <Skeleton className="h-8 w-16" /> : inactivePatients}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients by name or email..." 
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
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value={PatientStatus.active}>Active</SelectItem>
                <SelectItem value={PatientStatus.inactive}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Patient Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Prescriptions</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full max-w-[140px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : patients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-muted-foreground/40" />
                      <p>No patients found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                patients?.map((patient) => (
                  <TableRow key={patient.id} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">DOB: {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{patient.email}</div>
                      <div className="text-xs text-muted-foreground">{patient.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={patient.address}>
                      {patient.address}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">{patient.prescriptionCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(patient.lastVisit), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {patient.status === PatientStatus.active ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        onClick={() => openEditDialog(patient)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
            <DialogDescription>
              Update information for {editingPatient?.name}.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PatientStatus.active}>Active</SelectItem>
                        <SelectItem value={PatientStatus.inactive}>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setEditingPatient(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePatientMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {updatePatientMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
