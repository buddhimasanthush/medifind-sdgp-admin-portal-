import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, doublePrecision as pgReal, timestamp as pgTimestamp, boolean as pgBoolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const settingsTable = isPostgres()
  ? pgTable("settings", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      platformName: pgText("platform_name").notNull().default("Medifind"),
      supportEmail: pgText("support_email").notNull().default("support@medifind.io"),
      ocrConfidenceThreshold: pgReal("ocr_confidence_threshold").notNull().default(0.94),
      autoApprovePharmacies: pgBoolean("auto_approve_pharmacies").notNull().default(false),
      maxPrescriptionsPerDay: pgInteger("max_prescriptions_per_day").notNull().default(500),
      maintenanceMode: pgBoolean("maintenance_mode").notNull().default(false),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("settings", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      platformName: sqliteText("platform_name").notNull().default("Medifind"),
      supportEmail: sqliteText("support_email").notNull().default("support@medifind.io"),
      ocrConfidenceThreshold: sqliteReal("ocr_confidence_threshold").notNull().default(0.94),
      autoApprovePharmacies: sqliteInteger("auto_approve_pharmacies", { mode: "boolean" }).notNull().default(false),
      maxPrescriptionsPerDay: sqliteInteger("max_prescriptions_per_day").notNull().default(500),
      maintenanceMode: sqliteInteger("maintenance_mode", { mode: "boolean" }).notNull().default(false),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    });

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
