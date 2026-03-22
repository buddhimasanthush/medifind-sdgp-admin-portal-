import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, doublePrecision as pgReal, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const ordersTable = isPostgres()
  ? pgTable("orders", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      orderId: pgText("order_id").notNull().unique(),
      patientName: pgText("patient_name").notNull(),
      pharmacyName: pgText("pharmacy_name").notNull(),
      medications: pgText("medications").notNull(),
      status: pgText("status").notNull().default("processing"),
      total: pgReal("total").notNull().default(0),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("orders", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      orderId: sqliteText("order_id").notNull().unique(),
      patientName: sqliteText("patient_name").notNull(),
      pharmacyName: sqliteText("pharmacy_name").notNull(),
      medications: sqliteText("medications").notNull(),
      status: sqliteText("status").notNull().default("processing"),
      total: sqliteReal("total").notNull().default(0),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    });

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
