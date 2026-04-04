import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const userLoginsTable = (isPostgres()
  ? pgTable("user_logins", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      username: pgText("username").unique(),
      email: pgText("email"),
      passwordPlain: pgText("password_plain"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("user_logins", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      username: sqliteText("username").unique(),
      email: sqliteText("email"),
      passwordPlain: sqliteText("password_plain"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertUserLoginSchema = createInsertSchema(userLoginsTable);
export const selectUserLoginSchema = createSelectSchema(userLoginsTable);

export type InsertUserLogin = z.infer<typeof insertUserLoginSchema>;
export type UserLogin = z.infer<typeof selectUserLoginSchema>;
