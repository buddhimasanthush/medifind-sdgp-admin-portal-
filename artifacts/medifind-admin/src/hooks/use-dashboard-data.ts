import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../../../lib/api-client-react/src/custom-fetch";

export type RecentScan = {
  id: string;
  userId: string;
  status: string;
  processingTimeMs: number;
  createdAt: string;
};

export type DashboardStats = {
  totalRevenue: number;
  activePatients: number;
  ocrSuccessRate: number;
  revenueChart: { name: string; revenue: number }[];
};

export function useDashboardData() {
  const queryClient = useQueryClient();

  // Fetch recent OCR scans
  const { data: ocrLogs = [], isLoading: isLoadingLogs } = useQuery<RecentScan[]>({
    queryKey: ["/api/ocr-logs"],
    queryFn: async () => {
      return await customFetch<RecentScan[]>("/api/ocr-logs");
    },
    refetchInterval: 30000,
  });

  // Fetch aggregate stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      return await customFetch<DashboardStats>("/api/stats");
    },
    refetchInterval: 30000,
  });

  // Transform recent scans to the format expected by the UI
  const recentScans = ocrLogs.slice(0, 6).map(log => ({
    id: log.id,
    userId: log.userId,
    timestamp: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
    status: log.status === "success" ? "Success" : 
            log.status === "manual_fallback" ? "Manual Fallback" : "Failed"
  }));

  return {
    recentScans,
    isLoading: isLoadingLogs || isLoadingStats,
    stats,
    ocrLogs
  };
}
