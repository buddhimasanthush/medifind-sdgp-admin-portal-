import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platformName: text("platform_name").notNull().default("Medifind"),
  supportEmail: text("support_email").notNull().default("support@medifind.io"),
  ocrConfidenceThreshold: real("ocr_confidence_threshold").notNull().default(0.94),
  autoApprovePharmacies: integer("auto_approve_pharmacies", { mode: "boolean" }).notNull().default(false),
  maxPrescriptionsPerDay: integer("max_prescriptions_per_day").notNull().default(500),
  maintenanceMode: integer("maintenance_mode", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
