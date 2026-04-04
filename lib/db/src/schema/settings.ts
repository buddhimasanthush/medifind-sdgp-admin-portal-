import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, boolean as pgBoolean, doublePrecision as pgReal, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const settingsTable = (isPostgres()
  ? pgTable("settings", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      platformName: pgText("platform_name"),
      supportEmail: pgText("support_email"),
      ocrConfidenceThreshold: pgReal("ocr_confidence_threshold"),
      autoApprovePharmacies: pgBoolean("auto_approve_pharmacies").default(false),
      maxPrescriptionsPerDay: pgInteger("max_prescriptions_per_day"),
      maintenanceMode: pgBoolean("maintenance_mode").default(false),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("settings", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      platformName: sqliteText("platform_name"),
      supportEmail: sqliteText("support_email"),
      ocrConfidenceThreshold: sqliteReal("ocr_confidence_threshold"),
      autoApprovePharmacies: sqliteInteger("auto_approve_pharmacies", { mode: "boolean" }).default(false),
      maxPrescriptionsPerDay: sqliteInteger("max_prescriptions_per_day"),
      maintenanceMode: sqliteInteger("maintenance_mode", { mode: "boolean" }).default(false),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    })) as any;

export const insertSettingSchema = createInsertSchema(settingsTable);
export const selectSettingSchema = createSelectSchema(settingsTable);

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = z.infer<typeof selectSettingSchema>;
