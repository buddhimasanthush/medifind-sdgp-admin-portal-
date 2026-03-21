import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ocrLogsTable = sqliteTable("ocr_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prescriptionId: text("prescription_id").notNull(),
  medicationName: text("medication_name").notNull(),
  pharmacyName: text("pharmacy_name").notNull(),
  patientName: text("patient_name").notNull(),
  status: text("status").notNull().default("success"),
  confidence: real("confidence").notNull().default(0),
  errorReason: text("error_reason"),
  scannedAt: text("scanned_at").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertOcrLogSchema = createInsertSchema(ocrLogsTable).omit({ id: true, createdAt: true });
export type InsertOcrLog = z.infer<typeof insertOcrLogSchema>;
export type OcrLog = typeof ocrLogsTable.$inferSelect;
