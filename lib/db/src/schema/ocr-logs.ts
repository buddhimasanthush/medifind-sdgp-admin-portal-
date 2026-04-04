import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const ocrLogsTable = (isPostgres()
  ? pgTable("ocr_logs", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: pgText("user_id").references(() => profilesTable.id),
      status: pgText("status"),
      processingTimeMs: pgInteger("processing_time_ms"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("ocr_logs", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: sqliteText("user_id").references(() => profilesTable.id),
      status: sqliteText("status"),
      processingTimeMs: sqliteInteger("processing_time_ms"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertOcrLogSchema = createInsertSchema(ocrLogsTable);
export const selectOcrLogSchema = createSelectSchema(ocrLogsTable);

export type InsertOcrLog = z.infer<typeof insertOcrLogSchema>;
export type OcrLog = z.infer<typeof selectOcrLogSchema>;
