import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import { serializeDates } from "../lib/serialize.js";

const router: IRouter = Router();

function normalizeSettings(raw: any) {
  const nowIso = new Date().toISOString();

  return {
    id: raw?.id != null ? String(raw.id) : "1",
    platformName: raw?.platformName ?? "Medifind",
    supportEmail: raw?.supportEmail ?? "support@medifind.com",
    ocrConfidenceThreshold:
      typeof raw?.ocrConfidenceThreshold === "number" ? raw.ocrConfidenceThreshold : 90,
    autoApprovePharmacies:
      typeof raw?.autoApprovePharmacies === "boolean" ? raw.autoApprovePharmacies : false,
    maxPrescriptionsPerDay:
      typeof raw?.maxPrescriptionsPerDay === "number" ? raw.maxPrescriptionsPerDay : 5000,
    maintenanceMode:
      typeof raw?.maintenanceMode === "boolean" ? raw.maintenanceMode : false,
    updatedAt:
      raw?.updatedAt instanceof Date
        ? raw.updatedAt.toISOString()
        : typeof raw?.updatedAt === "string"
          ? raw.updatedAt
          : nowIso,
  };
}

router.get("/settings", async (req, res): Promise<void> => {
  try {
    const [settings] = await db.select().from(settingsTable).limit(1);
    const normalized = normalizeSettings(serializeDates(settings ?? {}));
    res.json(GetSettingsResponse.parse(normalized));
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

    const normalized = normalizeSettings(serializeDates(settings ?? {}));
    res.json(UpdateSettingsResponse.parse(normalized));
  } catch (error: any) {
    console.error("[settings] Route error:", req.method, req.path, error?.message);
    res.status(500).json({
      error: error?.message || "Internal server error",
      detail: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
});

export default router;
