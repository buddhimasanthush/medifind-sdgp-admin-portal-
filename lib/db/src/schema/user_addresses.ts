import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, timestamp as pgTimestamp, boolean as pgBoolean, numeric as pgNumeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const userAddressesTable = (isPostgres()
  ? pgTable("user_addresses", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: pgText("user_id").references(() => profilesTable.id).notNull(),
      label: pgText("label"),
      addressLine: pgText("address_line"),
      latitude: pgNumeric("latitude"),
      longitude: pgNumeric("longitude"),
      isDefault: pgBoolean("is_default").default(false),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("user_addresses", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: sqliteText("user_id").references(() => profilesTable.id).notNull(),
      label: sqliteText("label"),
      addressLine: sqliteText("address_line"),
      latitude: sqliteReal("latitude"),
      longitude: sqliteReal("longitude"),
      isDefault: sqliteInteger("is_default", { mode: "boolean" }).default(false),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertUserAddressSchema = createInsertSchema(userAddressesTable);
export const selectUserAddressSchema = createSelectSchema(userAddressesTable);

export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type UserAddress = z.infer<typeof selectUserAddressSchema>;
