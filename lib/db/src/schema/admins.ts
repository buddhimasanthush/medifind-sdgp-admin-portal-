import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const adminsTable = isPostgres()
  ? pgTable("admins", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      username: pgText("username").notNull().unique(),
      passwordHash: pgText("password_hash").notNull(),
      employeeId: pgText("employee_id").notNull().unique(),
      status: pgText("status").notNull().default("pending"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("admins", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      username: sqliteText("username").notNull().unique(),
      passwordHash: sqliteText("password_hash").notNull(),
      employeeId: sqliteText("employee_id").notNull().unique(),
      status: sqliteText("status").notNull().default("pending"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    });

export const insertAdminSchema = createInsertSchema(adminsTable);
export const selectAdminSchema = createSelectSchema(adminsTable);

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = z.infer<typeof selectAdminSchema>;


