import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const pharmaciesTable = isPostgres()
  ? pgTable("pharmacies", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      name: pgText("name").notNull(),
      registrationNumber: pgText("registration_number").notNull().unique(),
      location: pgText("location").notNull(),
      contactEmail: pgText("contact_email").notNull(),
      phone: pgText("phone").notNull(),
      licenseExpiry: pgText("license_expiry").notNull(),
      username: pgText("username").notNull().unique(),
      passwordHash: pgText("password_hash").notNull(),
      status: pgText("status").notNull().default("pending"),
      dateApplied: pgText("date_applied").notNull(),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("pharmacies", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      registrationNumber: sqliteText("registration_number").notNull().unique(),
      location: sqliteText("location").notNull(),
      contactEmail: sqliteText("contact_email").notNull(),
      phone: sqliteText("phone").notNull(),
      licenseExpiry: sqliteText("license_expiry").notNull(),
      username: sqliteText("username").notNull().unique(),
      passwordHash: sqliteText("password_hash").notNull(),
      status: sqliteText("status").notNull().default("pending"),
      dateApplied: sqliteText("date_applied").notNull(),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    });

export const insertPharmacySchema = createInsertSchema(pharmaciesTable).omit({ createdAt: true, updatedAt: true });
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmaciesTable.$inferSelect;
