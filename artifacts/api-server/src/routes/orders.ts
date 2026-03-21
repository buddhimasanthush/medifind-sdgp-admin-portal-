import { Router, type IRouter } from "express";
import { db, ordersTable, ilike, or, eq } from "@workspace/db";
import {
  ListOrdersQueryParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  ListOrdersResponse,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";
import { serializeDates, serializeDatesArray } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
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
    rows = rows.where(
      or(
        ilike(ordersTable.patientName, term),
        ilike(ordersTable.pharmacyName, term),
        ilike(ordersTable.orderId, term),
        ilike(ordersTable.medications, term)
      )
    );
  }

  const results = await rows.orderBy(ordersTable.createdAt);
  res.json(ListOrdersResponse.parse(serializeDatesArray(results)));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse(serializeDates(order)));
});

export default router;
