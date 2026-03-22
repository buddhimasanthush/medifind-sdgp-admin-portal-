import { Router, type IRouter } from "express";
import { db, ordersTable, patientsTable, ocrLogsTable, sql, eq, count, sum } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    // 1. Total Revenue
    const [revenueRes] = await db.select({ value: sum(ordersTable.total) }).from(ordersTable);
    const totalRevenue = Number(revenueRes?.value || 0);

    // 2. Active Patients
    const [patientsRes] = await db.select({ value: count() }).from(patientsTable).where(eq(patientsTable.status, "active"));
    const activePatients = Number(patientsRes?.value || 0);

    // 3. OCR Success Rate
    const [totalScansRes] = await db.select({ value: count() }).from(ocrLogsTable);
    const [successScansRes] = await db.select({ value: count() }).from(ocrLogsTable).where(eq(ocrLogsTable.status, "success"));
    
    const totalScans = Number(totalScansRes?.value || 0);
    const successScans = Number(successScansRes?.value || 0);
    const ocrSuccessRate = totalScans > 0 ? (successScans / totalScans) * 100 : 0;

    const isPostgres = () => 
      (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
      (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

    // 4. Revenue for Chart (Last 12 months)
    const monthSql = isPostgres() 
      ? sql<string>`to_char(${ordersTable.createdAt}, 'MM')`
      : sql<string>`strftime('%m', datetime(${ordersTable.createdAt}, 'unixepoch'))`;

    const chartRes = await db.select({
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
      revenueChart
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
