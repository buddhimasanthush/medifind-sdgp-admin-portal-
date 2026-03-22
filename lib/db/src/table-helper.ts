import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, doublePrecision as pgReal, timestamp as pgTimestamp } from "drizzle-orm/pg-core";

const isPostgres = () => 
  process.env.SUPABASE_DB_URL || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgres") || process.env.DATABASE_URL.includes("supabase")));

export function dynamicTable<TTableName extends string, TColumns extends Record<string, any>>(
  name: TTableName,
  sqliteColumns: TColumns,
  pgColumns: any
) {
  return isPostgres() ? pgTable(name, pgColumns) : sqliteTable(name, sqliteColumns);
}

export const t = {
  text: (name: string) => isPostgres() ? pgText(name) : sqliteText(name),
  integer: (name: string, options?: { autoIncrement?: boolean }) => 
    isPostgres() 
      ? pgInteger(name).generatedAlwaysAsIdentity() 
      : sqliteInteger(name).primaryKey(options),
  primaryKey: (name: string) => 
    isPostgres() 
      ? pgInteger(name).primaryKey().generatedAlwaysAsIdentity() 
      : sqliteInteger(name).primaryKey({ autoIncrement: true }),
  timestamp: (name: string) => 
    isPostgres() 
      ? pgTimestamp(name, { withTimezone: true }).defaultNow() 
      : sqliteInteger(name, { mode: "timestamp" }).defaultNow(),
  real: (name: string) => isPostgres() ? pgReal(name) : sqliteReal(name),
};
