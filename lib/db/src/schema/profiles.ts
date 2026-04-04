import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, timestamp as pgTimestamp, boolean as pgBoolean, date as pgDate, bigint as pgBigInt, numeric as pgNumeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const profilesTable = (isPostgres()
  ? pgTable("profiles", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      fullName: pgText("full_name"),
      email: pgText("email").unique(),
      avatarColor: pgBigInt("avatar_color", { mode: "number" }),
      emoji: pgText("emoji"),
      phoneNumber: pgText("phone_number"),
      dateOfBirth: pgDate("date_of_birth", { mode: "string" }),
      bloodType: pgText("blood_type"),
      weightKg: pgNumeric("weight_kg"),
      allergies: pgText("allergies").array(),
      chronicConditions: pgText("chronic_conditions").array(),
      hasCompletedOnboarding: pgBoolean("has_completed_onboarding").default(false),
      role: pgText("role"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("profiles", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      fullName: sqliteText("full_name"),
      email: sqliteText("email").unique(),
      avatarColor: sqliteInteger("avatar_color"),
      emoji: sqliteText("emoji"),
      phoneNumber: sqliteText("phone_number"),
      dateOfBirth: sqliteText("date_of_birth"),
      bloodType: sqliteText("blood_type"),
      weightKg: sqliteReal("weight_kg"),
      allergies: sqliteText("allergies", { mode: "json" }).$type<string[]>(),
      chronicConditions: sqliteText("chronic_conditions", { mode: "json" }).$type<string[]>(),
      hasCompletedOnboarding: sqliteInteger("has_completed_onboarding", { mode: "boolean" }).default(false),
      role: sqliteText("role"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertProfileSchema = createInsertSchema(profilesTable);
export const selectProfileSchema = createSelectSchema(profilesTable);

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = z.infer<typeof selectProfileSchema>;
