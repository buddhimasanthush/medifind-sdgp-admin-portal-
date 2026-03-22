import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = typeof import.meta.url !== 'undefined' 
  ? path.dirname(fileURLToPath(import.meta.url)) 
  : process.cwd();

const defaultDbPath = path.resolve(__dirname, "../sqlite.db");
const isPostgres = () =>
  (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.trim() !== "") ||
  (process.env.DATABASE_URL && (
    process.env.DATABASE_URL.startsWith("postgres") ||
    process.env.DATABASE_URL.includes("supabase")
  ));

const dbPath = process.env.DATABASE_URL || defaultDbPath;

console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("SUPABASE_DB_URL present:", !!process.env.SUPABASE_DB_URL);
console.log("isPostgres result:", !!isPostgres());

let db: any;

if (isPostgres()) {
  console.log("Database: Initializing PostgreSQL (Supabase) connection...");
  const { drizzle: drizzlePg } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const pool = new pg.default.Pool({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  db = drizzlePg(pool, { schema });
} else {
  console.log("Database: Initializing SQLite connection...");
  const { drizzle: drizzleLibsql } = await import("drizzle-orm/libsql");
  const { createClient } = await import("@libsql/client");
  const tursoUrl = process.env.TURSO_CONNECTION_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const connectionUrl = tursoUrl || `file:${dbPath}`;

  const client = createClient({
    url: connectionUrl,
    authToken: tursoToken,
  });

  db = drizzleLibsql(client, { schema });
}

export { db };
export * from "./schema";
export * from "drizzle-orm";
