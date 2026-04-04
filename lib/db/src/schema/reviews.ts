import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";
import { pharmaciesTable } from "./pharmacies";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const reviewsTable = (isPostgres()
  ? pgTable("reviews", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: pgText("user_id").references(() => profilesTable.id).notNull(),
      pharmacyId: pgText("pharmacy_id").references(() => pharmaciesTable.id).notNull(),
      rating: pgInteger("rating"), // constraint 1 to 5 handled in zod
      comment: pgText("comment"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("reviews", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: sqliteText("user_id").references(() => profilesTable.id).notNull(),
      pharmacyId: sqliteText("pharmacy_id").references(() => pharmaciesTable.id).notNull(),
      rating: sqliteInteger("rating"),
      comment: sqliteText("comment"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertReviewSchema = createInsertSchema(reviewsTable);
export const selectReviewSchema = createSelectSchema(reviewsTable);

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof selectReviewSchema>;
