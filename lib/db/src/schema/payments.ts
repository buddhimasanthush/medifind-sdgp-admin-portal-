import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, numeric as pgNumeric, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const paymentsTable = (isPostgres()
  ? pgTable("payments", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      orderId: pgText("order_id").references(() => ordersTable.id).notNull(),
      transactionId: pgText("transaction_id"),
      method: pgText("method"),
      status: pgText("status"),
      amount: pgNumeric("amount"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("payments", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      orderId: sqliteText("order_id").references(() => ordersTable.id).notNull(),
      transactionId: sqliteText("transaction_id"),
      method: sqliteText("method"),
      status: sqliteText("status"),
      amount: sqliteReal("amount"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertPaymentSchema = createInsertSchema(paymentsTable);
export const selectPaymentSchema = createSelectSchema(paymentsTable);

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;
