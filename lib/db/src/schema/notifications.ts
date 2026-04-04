import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, boolean as pgBoolean, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const notificationsTable = (isPostgres()
  ? pgTable("notifications", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      type: pgText("type"),
      message: pgText("message"),
      read: pgBoolean("read").default(false),
      metadata: pgText("metadata"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("notifications", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      type: sqliteText("type"),
      message: sqliteText("message"),
      read: sqliteInteger("read", { mode: "boolean" }).default(false),
      metadata: sqliteText("metadata"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertNotificationSchema = createInsertSchema(notificationsTable);
export const selectNotificationSchema = createSelectSchema(notificationsTable);

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
