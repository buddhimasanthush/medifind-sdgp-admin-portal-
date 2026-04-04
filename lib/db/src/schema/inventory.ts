import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, numeric as pgNumeric, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pharmaciesTable } from "./pharmacies";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const inventoryTable = (isPostgres()
  ? pgTable("inventory", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      pharmacyId: pgText("pharmacy_id").references(() => pharmaciesTable.id).notNull(),
      medicineName: pgText("medicine_name"),
      category: pgText("category"),
      stockQuantity: pgInteger("stock_quantity"),
      price: pgNumeric("price"),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("inventory", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      pharmacyId: sqliteText("pharmacy_id").references(() => pharmaciesTable.id).notNull(),
      medicineName: sqliteText("medicine_name"),
      category: sqliteText("category"),
      stockQuantity: sqliteInteger("stock_quantity"),
      price: sqliteReal("price"),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    })) as any;

export const insertInventorySchema = createInsertSchema(inventoryTable);
export const selectInventorySchema = createSelectSchema(inventoryTable);

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = z.infer<typeof selectInventorySchema>;
