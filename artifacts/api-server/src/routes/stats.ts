import { Router, type IRouter } from "express";
import { db, ordersTable, patientsTable, ocrLogsTable, pharmaciesTable, sql, eq, sum } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const dba = db as any;

    // 1. Total Revenue
    const [revenueRes] = await dba.select({ value: sum(ordersTable.total) }).from(ordersTable);
    const totalRevenue = Number(revenueRes?.value || 0);

    // 2. Active Patients
    const [patientsRes] = await dba.select({ value: sql<number>`count(*)` }).from(patientsTable).where(eq(patientsTable.status, "active"));
    const activePatients = Number(patientsRes?.value || 0);

    // 3. OCR Success Rate
    const [totalScansRes] = await dba.select({ value: sql<number>`count(*)` }).from(ocrLogsTable);
    const [successScansRes] = await dba.select({ value: sql<number>`count(*)` }).from(ocrLogsTable).where(eq(ocrLogsTable.status, "success"));
    
    const totalScans = Number(totalScansRes?.value || 0);
    const successScans = Number(successScansRes?.value || 0);
    const ocrSuccessRate = totalScans > 0 ? (successScans / totalScans) * 100 : 0;

    // 4. Pending Pharmacies
    const [pendingPharmaciesRes] = await dba.select({ value: sql<number>`count(*)` }).from(pharmaciesTable).where(eq(pharmaciesTable.status, "pending"));
    const pendingPharmacies = Number(pendingPharmaciesRes?.value || 0);

    // 5. Total counts for dashboard
    const [totalPharmaciesRes] = await dba.select({ value: sql<number>`count(*)` }).from(pharmaciesTable);
    const [totalPatientsRes] = await dba.select({ value: sql<number>`count(*)` }).from(patientsTable);
    const [totalOrdersRes] = await dba.select({ value: sql<number>`count(*)` }).from(ordersTable);
    const [totalOcrLogsRes] = await dba.select({ value: sql<number>`count(*)` }).from(ocrLogsTable);

    const isPostgres = () => 
      (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
      (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

    // 6. Revenue for Chart (Last 12 months)
    const monthSql = isPostgres() 
      ? sql<string>`to_char(${ordersTable.createdAt}, 'MM')`
      : sql<string>`strftime('%m', datetime(${ordersTable.createdAt}, 'unixepoch'))`;

    const chartRes = await dba.select({
      month: monthSql,
      revenue: sum(ordersTable.total)
    })
    .from(ordersTable)
    .groupBy(monthSql)
    .orderBy(monthSql);

    // Map month numbers to names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChart = monthNames.map((name, i) => {
      const monthNum = (i + 1).toString().padStart(2, '0');
      const found = chartRes.find((r: any) => r.month === monthNum);
      return { name, revenue: Number(found?.revenue || 0) };
    });

    res.json({
      totalRevenue,
      activePatients,
      ocrSuccessRate,
      revenueChart,
      pendingPharmacies,
      totalPharmacies: totalPharmaciesRes?.value ?? 0,
      totalPatients: totalPatientsRes?.value ?? 0,
      totalOrders: totalOrdersRes?.value ?? 0,
      totalOcrLogs: totalOcrLogsRes?.value ?? 0,
    });
  } catch (error: any) {
    console.error("[stats] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
