import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PharmacyApproval = {
  id: number;
  name: string;
  registrationNumber: string;
  location: string;
  dateApplied: string;
  status: string;
};

export type RecentScan = {
  id: number;
  prescriptionId: string;
  medicationName: string;
  pharmacyName: string;
  scannedAt: string;
  status: string;
  confidence: number;
};

export type DashboardStats = {
  totalRevenue: number;
  activePatients: number;
  ocrSuccessRate: number;
  revenueChart: { name: string; revenue: number }[];
};

export function useDashboardData() {
  const queryClient = useQueryClient();

  // Fetch pending pharmacies
  const { data: approvals = [], isLoading: isLoadingApprovals } = useQuery<PharmacyApproval[]>({
    queryKey: ["/api/pharmacies", { status: "pending" }],
    queryFn: async () => {
      const res = await fetch("/api/pharmacies?status=pending");
      if (!res.ok) throw new Error("Failed to fetch pending pharmacies");
      return res.json();
    },
  });

  // Fetch recent OCR scans
  const { data: ocrLogs = [], isLoading: isLoadingLogs } = useQuery<RecentScan[]>({
    queryKey: ["/api/ocr-logs"],
    queryFn: async () => {
      const res = await fetch("/api/ocr-logs");
      if (!res.ok) throw new Error("Failed to fetch OCR logs");
      return res.json();
    },
  });

  // Fetch orders for revenue calculation
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  // Fetch aggregate stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/pharmacies/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacies"] });
    },
  });

  const approvePharmacy = (id: number) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const rejectPharmacy = (id: number) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };

  // Transform recent scans to the format expected by the UI
  const recentScans = ocrLogs.slice(0, 6).map(log => ({
    id: `s${log.id}`,
    prescriptionName: log.medicationName,
    pharmacyName: log.pharmacyName,
    timestamp: new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: log.status === "success" ? "Success" : "Manual Fallback"
  }));

  return {
    approvals,
    approvePharmacy,
    rejectPharmacy,
    recentScans,
    isLoading: isLoadingApprovals || isLoadingLogs || isLoadingStats,
    orders,
    stats
  };
}
