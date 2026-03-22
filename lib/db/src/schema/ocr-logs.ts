import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, doublePrecision as pgReal, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const ocrLogsTable = isPostgres()
  ? pgTable("ocr_logs", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      prescriptionId: pgText("prescription_id").notNull(),
      medicationName: pgText("medication_name").notNull(),
      pharmacyName: pgText("pharmacy_name").notNull(),
      patientName: pgText("patient_name").notNull(),
      status: pgText("status").notNull().default("success"),
      confidence: pgReal("confidence").notNull().default(0),
      errorReason: pgText("error_reason"),
      scannedAt: pgText("scanned_at").notNull(),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("ocr_logs", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      prescriptionId: sqliteText("prescription_id").notNull(),
      medicationName: sqliteText("medication_name").notNull(),
      pharmacyName: sqliteText("pharmacy_name").notNull(),
      patientName: sqliteText("patient_name").notNull(),
      status: sqliteText("status").notNull().default("success"),
      confidence: sqliteReal("confidence").notNull().default(0),
      errorReason: sqliteText("error_reason"),
      scannedAt: sqliteText("scanned_at").notNull(),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    });

export const insertOcrLogSchema = createInsertSchema(ocrLogsTable).omit({ createdAt: true });
export type InsertOcrLog = z.infer<typeof insertOcrLogSchema>;
export type OcrLog = typeof ocrLogsTable.$inferSelect;
