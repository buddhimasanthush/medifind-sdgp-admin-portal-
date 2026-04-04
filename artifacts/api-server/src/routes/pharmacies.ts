import { Router, type IRouter } from "express";
import { db, pharmaciesTable, notificationsTable, ilike, or, eq } from "@workspace/db";
import {
  ListPharmaciesQueryParams,
  CreatePharmacyBody,
  ListPharmaciesResponse,
  Pharmacy as PharmacySchema,
} from "@workspace/api-zod";
import { serializeDates, serializeDatesArray } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/pharmacies", async (req, res): Promise<void> => {
  try {
    const query = ListPharmaciesQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    let rows = db.select().from(pharmaciesTable).$dynamic();

    if (query.data.search) {
      const term = `%${query.data.search}%`;
      rows = rows.where(
        or(
          ilike(pharmaciesTable.name, term),
          ilike(pharmaciesTable.address, term)
        )
      );
    }

    const results = await rows.orderBy(pharmaciesTable.createdAt);
    res.json(serializeDatesArray(results));
  } catch (error: any) {
    console.error("[pharmacies] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

router.post("/pharmacies", async (req, res): Promise<void> => {
  try {
    const parsed = CreatePharmacyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [pharmacy] = await db.insert(pharmaciesTable).values(parsed.data).returning();
    
    // Create notification for admin
    await db.insert(notificationsTable).values({
      type: "new_pharmacy_registration",
      message: `New pharmacy registration: ${pharmacy.name}`,
      metadata: JSON.stringify({ pharmacyId: pharmacy.id }),
    });

    res.status(201).json(serializeDates(pharmacy));
  } catch (error: any) {
    console.error("[pharmacies] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

router.get("/pharmacies/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, id));

    if (!pharmacy) {
      res.status(404).json({ error: "Pharmacy not found" });
      return;
    }

    res.json(serializeDates(pharmacy));
  } catch (error: any) {
    console.error("[pharmacies] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
