import { Router, type IRouter } from "express";
import { db, ordersTable, ilike, or, eq } from "@workspace/db";
import {
  ListOrdersQueryParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { serializeDates, serializeDatesArray } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  try {
    const query = ListOrdersQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    let rows = db.select().from(ordersTable).$dynamic();

    if (query.data.status) {
      rows = rows.where(eq(ordersTable.status, query.data.status));
    }

    if (query.data.search) {
      const term = `%${query.data.search}%`;
      // Searching by ID or Status in the base table
      rows = rows.where(
        or(
          ilike(ordersTable.id, term),
          ilike(ordersTable.status, term)
        )
      );
    }

    const results = await rows.orderBy(ordersTable.createdAt);
    res.json(serializeDatesArray(results));
  } catch (error: any) {
    console.error("[orders] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const parsed = UpdateOrderStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status: parsed.data.status })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(serializeDates(order));
  } catch (error: any) {
    console.error("[orders] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
