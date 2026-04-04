import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import { serializeDates } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/settings", async (req, res): Promise<void> => {
  try {
    const [settings] = await db.select().from(settingsTable).limit(1);

    // If no settings row exists, return safe defaults instead of empty/null
    if (!settings) {
      res.json({
        platformName: "Medifind",
        supportEmail: "support@medifind.com",
        ocrConfidenceThreshold: 0.9,
        autoApprovePharmacies: false,
        maxPrescriptionsPerDay: 5000,
      });
      return;
    }

    res.json(GetSettingsResponse.parse(serializeDates(settings)));
  } catch (error: any) {
    console.error("[settings] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

router.put("/settings", async (req, res): Promise<void> => {
  try {
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
  } catch (error: any) {
    console.error("[settings] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
