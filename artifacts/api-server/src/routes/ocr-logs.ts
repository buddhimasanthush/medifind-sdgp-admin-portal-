import { Router, type IRouter } from "express";
import { db, ocrLogsTable, ilike, or, eq } from "@workspace/db";
import {
  ListOcrLogsQueryParams,
  ListOcrLogsResponse,
} from "@workspace/api-zod";
import { serializeDatesArray } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/ocr-logs", async (req, res): Promise<void> => {
  try {
    const query = ListOcrLogsQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    let rows = db.select().from(ocrLogsTable).$dynamic();

    if (query.data.status) {
      rows = rows.where(eq(ocrLogsTable.status, query.data.status));
    }

    if (query.data.search) {
      const term = `%${query.data.search}%`;
      rows = rows.where(
        or(
          ilike(ocrLogsTable.medicationName, term),
          ilike(ocrLogsTable.pharmacyName, term),
          ilike(ocrLogsTable.patientName, term),
          ilike(ocrLogsTable.prescriptionId, term)
        )
      );
    }

    const results = await rows.orderBy(ocrLogsTable.createdAt);
    res.json(ListOcrLogsResponse.parse(serializeDatesArray(results)));
  } catch (error: any) {
    console.error("[ocr-logs] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
