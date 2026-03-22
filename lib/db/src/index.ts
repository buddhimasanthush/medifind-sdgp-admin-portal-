import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = typeof import.meta.url !== 'undefined' 
  ? path.dirname(fileURLToPath(import.meta.url)) 
  : process.cwd();

const defaultDbPath = path.resolve(__dirname, "../sqlite.db");
const dbPath = process.env.DATABASE_URL || defaultDbPath;

// Support for Turso (Cloud SQLite) or Local SQLite or Supabase (Postgres)
const tursoUrl = process.env.TURSO_CONNECTION_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

let db: any;

if (supabaseUrl && (supabaseUrl.startsWith("postgres") || supabaseUrl.includes("supabase"))) {
  console.log("Database: Initializing PostgreSQL (Supabase) connection...");
  const { drizzle: drizzlePg } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const pool = new pg.default.Pool({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  db = drizzlePg(pool, { schema });
} else {
  console.log("Database: Initializing SQLite connection...");
  // Local path must be prefixed with file:
  const connectionUrl = tursoUrl || `file:${dbPath}`;

  const client = createClient({
    url: connectionUrl,
    authToken: tursoToken,
  });

  db = drizzle(client, { schema });
}

export { db };
export * from "./schema";
export * from "drizzle-orm";
