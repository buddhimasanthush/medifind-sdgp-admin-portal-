import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, numeric as pgNumeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";
import { medicinesTable } from "./medicines";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const orderItemsTable = (isPostgres()
  ? pgTable("order_items", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      orderId: pgText("order_id").references(() => ordersTable.id).notNull(),
      medicineId: pgText("medicine_id").references(() => medicinesTable.id).notNull(),
      quantity: pgInteger("quantity"),
      unitPrice: pgNumeric("unit_price"),
    })
  : sqliteTable("order_items", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      orderId: sqliteText("order_id").references(() => ordersTable.id).notNull(),
      medicineId: sqliteText("medicine_id").references(() => medicinesTable.id).notNull(),
      quantity: sqliteInteger("quantity"),
      unitPrice: sqliteReal("unit_price"),
    })) as any;

export const insertOrderItemSchema = createInsertSchema(orderItemsTable);
export const selectOrderItemSchema = createSelectSchema(orderItemsTable);

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = z.infer<typeof selectOrderItemSchema>;
