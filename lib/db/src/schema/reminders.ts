import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp, date as pgDate, time as pgTime, boolean as pgBoolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const remindersTable = (isPostgres()
  ? pgTable("reminders", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: pgText("user_id").references(() => profilesTable.id).notNull(),
      medicineName: pgText("medicine_name"),
      times: pgTime("times").array(),
      days: pgBoolean("days").array(),
      startDate: pgDate("start_date", { mode: "string" }),
      endDate: pgDate("end_date", { mode: "string" }),
      description: pgText("description"),
      frequency: pgText("frequency"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("reminders", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: sqliteText("user_id").references(() => profilesTable.id).notNull(),
      medicineName: sqliteText("medicine_name"),
      times: sqliteText("times", { mode: "json" }).$type<string[]>(),
      days: sqliteText("days", { mode: "json" }).$type<boolean[]>(),
      startDate: sqliteText("start_date"),
      endDate: sqliteText("end_date"),
      description: sqliteText("description"),
      frequency: sqliteText("frequency"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertReminderSchema = createInsertSchema(remindersTable);
export const selectReminderSchema = createSelectSchema(remindersTable);

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = z.infer<typeof selectReminderSchema>;
