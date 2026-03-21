import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import { serializeDates } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  let [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    [settings] = await db.insert(settingsTable).values({}).returning();
  }

  res.json(GetSettingsResponse.parse(serializeDates(settings)));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    [settings] = await db.insert(settingsTable).values(parsed.data).returning();
  } else {
    [settings] = await db
      .update(settingsTable)
      .set(parsed.data)
      .returning();
  }

  res.json(UpdateSettingsResponse.parse(serializeDates(settings)));
});

export default router;
