import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../../../lib/api-client-react/src/custom-fetch";

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
      return await customFetch<PharmacyApproval[]>("/api/pharmacies?status=pending");
    },
  });

  // Fetch recent OCR scans
  const { data: ocrLogs = [], isLoading: isLoadingLogs } = useQuery<RecentScan[]>({
    queryKey: ["/api/ocr-logs"],
    queryFn: async () => {
      return await customFetch<RecentScan[]>("/api/ocr-logs");
    },
  });

  // Fetch orders for revenue calculation
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      return await customFetch("/api/orders");
    },
  });

  // Fetch aggregate stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      return await customFetch<DashboardStats>("/api/stats");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await customFetch(`/api/pharmacies/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
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
