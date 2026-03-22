import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const patientsTable = isPostgres()
  ? pgTable("patients", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      name: pgText("name").notNull(),
      email: pgText("email").notNull().unique(),
      phone: pgText("phone").notNull(),
      dateOfBirth: pgText("date_of_birth").notNull(),
      address: pgText("address").notNull(),
      prescriptionCount: pgInteger("prescription_count").notNull().default(0),
      lastVisit: pgText("last_visit").notNull(),
      username: pgText("username").notNull().unique(),
      passwordHash: pgText("password_hash").notNull(),
      status: pgText("status").notNull().default("active"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    })
  : sqliteTable("patients", {
      id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      email: sqliteText("email").notNull().unique(),
      phone: sqliteText("phone").notNull(),
      dateOfBirth: sqliteText("date_of_birth").notNull(),
      address: sqliteText("address").notNull(),
      prescriptionCount: sqliteInteger("prescription_count").notNull().default(0),
      lastVisit: sqliteText("last_visit").notNull(),
      username: sqliteText("username").notNull().unique(),
      passwordHash: sqliteText("password_hash").notNull(),
      status: sqliteText("status").notNull().default("active"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
    });

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
