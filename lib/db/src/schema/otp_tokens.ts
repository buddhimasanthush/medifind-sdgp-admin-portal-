import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, boolean as pgBoolean, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const otpTokensTable = (isPostgres()
  ? pgTable("otp_tokens", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      email: pgText("email"),
      otpHash: pgText("otp_hash"),
      purpose: pgText("purpose"),
      used: pgBoolean("used").default(false),
      expiresAt: pgTimestamp("expires_at", { withTimezone: true }),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("otp_tokens", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      email: sqliteText("email"),
      otpHash: sqliteText("otp_hash"),
      purpose: sqliteText("purpose"),
      used: sqliteInteger("used", { mode: "boolean" }).default(false),
      expiresAt: sqliteInteger("expires_at", { mode: "timestamp" }),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertOtpTokenSchema = createInsertSchema(otpTokensTable);
export const selectOtpTokenSchema = createSelectSchema(otpTokensTable);

export type InsertOtpToken = z.infer<typeof insertOtpTokenSchema>;
export type OtpToken = z.infer<typeof selectOtpTokenSchema>;
