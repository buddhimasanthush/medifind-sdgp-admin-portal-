import { Router, type IRouter } from "express";
import { db, patientsTable, ilike, or, eq } from "@workspace/db";
import {
  ListPatientsQueryParams,
  CreatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  UpdatePatientBody,
  ListPatientsResponse,
  GetPatientResponse,
  UpdatePatientResponse,
} from "@workspace/api-zod";
import { serializeDates, serializeDatesArray } from "../lib/serialize.js";
import { hashPassword } from "../lib/hash.js";

const router: IRouter = Router();

router.get("/patients", async (req, res): Promise<void> => {
  const query = ListPatientsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows = db.select().from(patientsTable).$dynamic();

  if (query.data.status) {
    rows = rows.where(eq(patientsTable.status, query.data.status));
  }

  if (query.data.search) {
    const term = `%${query.data.search}%`;
    rows = rows.where(
      or(
        ilike(patientsTable.name, term),
        ilike(patientsTable.email, term),
        ilike(patientsTable.phone, term)
      )
    );
  }

  const results = await rows.orderBy(patientsTable.createdAt);
  res.json(ListPatientsResponse.parse(serializeDatesArray(results)));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await hashPassword(password);

  const [patient] = await db.insert(patientsTable).values({
    ...rest,
    passwordHash,
  }).returning();
  res.status(201).json(GetPatientResponse.parse(serializeDates(patient)));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(GetPatientResponse.parse(serializeDates(patient)));
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db
    .update(patientsTable)
    .set(parsed.data)
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(UpdatePatientResponse.parse(serializeDates(patient)));
});

export default router;
