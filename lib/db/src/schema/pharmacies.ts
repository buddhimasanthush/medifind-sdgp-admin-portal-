import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, timestamp as pgTimestamp, numeric as pgNumeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const pharmaciesTable = (isPostgres()
  ? pgTable("pharmacies", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: pgText("name").unique(),
      address: pgText("address"),
      latitude: pgNumeric("latitude"),
      longitude: pgNumeric("longitude"),
      phone: pgText("phone"),
      openingHours: pgText("opening_hours"),
      externalUrl: pgText("external_url"),
      externalKey: pgText("external_key"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("pharmacies", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: sqliteText("name").unique(),
      address: sqliteText("address"),
      latitude: sqliteReal("latitude"),
      longitude: sqliteReal("longitude"),
      phone: sqliteText("phone"),
      openingHours: sqliteText("opening_hours"),
      externalUrl: sqliteText("external_url"),
      externalKey: sqliteText("external_key"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertPharmacySchema = createInsertSchema(pharmaciesTable);
export const selectPharmacySchema = createSelectSchema(pharmaciesTable);

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = z.infer<typeof selectPharmacySchema>;
