import { Router, type IRouter } from "express";
import { db, pharmaciesTable, notificationsTable, ilike, or, eq } from "@workspace/db";
import {
  ListPharmaciesQueryParams,
  CreatePharmacyBody,
  GetPharmacyParams,
  UpdatePharmacyStatusParams,
  UpdatePharmacyStatusBody,
  ListPharmaciesResponse,
  GetPharmacyResponse,
  UpdatePharmacyStatusResponse,
} from "@workspace/api-zod";
import { serializeDates, serializeDatesArray } from "../lib/serialize.js";
import { hashPassword } from "../lib/hash.js";

const router: IRouter = Router();

router.get("/pharmacies", async (req, res): Promise<void> => {
  const query = ListPharmaciesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows = db.select().from(pharmaciesTable).$dynamic();

  if (query.data.status) {
    rows = rows.where(eq(pharmaciesTable.status, query.data.status));
  }

  if (query.data.search) {
    const term = `%${query.data.search}%`;
    rows = rows.where(
      or(
        ilike(pharmaciesTable.name, term),
        ilike(pharmaciesTable.location, term),
        ilike(pharmaciesTable.registrationNumber, term)
      )
    );
  }

  const results = await rows.orderBy(pharmaciesTable.createdAt);
  res.json(ListPharmaciesResponse.parse(serializeDatesArray(results)));
});

router.post("/pharmacies", async (req, res): Promise<void> => {
  const parsed = CreatePharmacyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await hashPassword(password);

  const [pharmacy] = await db.insert(pharmaciesTable).values({
    ...rest,
    passwordHash,
  }).returning();
  
  // Create notification for admin
  await db.insert(notificationsTable).values({
    type: "new_pharmacy_registration",
    message: `New pharmacy registration: ${pharmacy.name} (${pharmacy.registrationNumber})`,
    metadata: JSON.stringify({ pharmacyId: pharmacy.id }),
  });

  res.status(201).json(GetPharmacyResponse.parse(serializeDates(pharmacy)));
});

router.get("/pharmacies/:id", async (req, res): Promise<void> => {
  const params = GetPharmacyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, params.data.id));

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  res.json(GetPharmacyResponse.parse(serializeDates(pharmacy)));
});

router.patch("/pharmacies/:id/status", async (req, res): Promise<void> => {
  const params = UpdatePharmacyStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePharmacyStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [pharmacy] = await db
    .update(pharmaciesTable)
    .set({ status: parsed.data.status })
    .where(eq(pharmaciesTable.id, params.data.id))
    .returning();

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  // Create notification for status change
  await db.insert(notificationsTable).values({
    type: "pharmacy_status_update",
    message: `Pharmacy "${pharmacy.name}" status updated to: ${pharmacy.status}`,
    metadata: JSON.stringify({ pharmacyId: pharmacy.id, status: pharmacy.status }),
  });

  res.json(UpdatePharmacyStatusResponse.parse(serializeDates(pharmacy)));
});

export default router;
