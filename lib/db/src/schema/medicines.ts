import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isPostgres = () => 
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export const medicinesTable = (isPostgres()
  ? pgTable("medicines", {
      id: pgText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: pgText("name"),
      category: pgText("category"),
      description: pgText("description"),
      createdAt: pgTimestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    })
  : sqliteTable("medicines", {
      id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: sqliteText("name"),
      category: sqliteText("category"),
      description: sqliteText("description"),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    })) as any;

export const insertMedicineSchema = createInsertSchema(medicinesTable);
export const selectMedicineSchema = createSelectSchema(medicinesTable);

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = z.infer<typeof selectMedicineSchema>;
