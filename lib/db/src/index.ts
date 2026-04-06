import * as schema from "./schema/index.js";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";
const { Pool } = pg;
import { createClient } from "@libsql/client";

// Read connection string — prefer DATABASE_URL, fall back to SUPABASE_DB_URL
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  "";

// Determine if we should connect to PostgreSQL (Supabase) or LibSQL (Turso)
const isPostgres =
  connectionString.startsWith("postgres") ||
  connectionString.includes("supabase");

// Startup diagnostic logs — visible in Railway Logs tab
console.log("[DB] isPostgres detected as:", isPostgres);

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn(
    "[DB] No PostgreSQL connection string detected in production. " +
    "Falling back to the bundled SQLite database file."
  );
}

function resolveSqliteUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  const configuredPath = process.env.LOCAL_SQLITE_PATH;
  if (configuredPath) {
    return configuredPath.startsWith("file:")
      ? configuredPath
      : `file:${configuredPath}`;
  }

  const sharedCandidates = [
    path.resolve(process.cwd(), "lib/db/sqlite.db"),
    path.resolve(process.cwd(), "../lib/db/sqlite.db"),
    path.resolve(process.cwd(), "../../lib/db/sqlite.db"),
  ];
  const localCandidates = [
    path.resolve(process.cwd(), "sqlite.db"),
    path.resolve(process.cwd(), "../sqlite.db"),
  ];

  const selectedPath =
    sharedCandidates.find((candidate) => existsSync(candidate)) ??
    localCandidates.find((candidate) => existsSync(candidate)) ??
    localCandidates[0];

  console.log("[DB] Using SQLite database file:", selectedPath);
  return `file:${selectedPath}`;
}

// Create the correct database client based on environment
const internalDb = isPostgres
  ? (() => {
      console.log("[DB] Initializing PostgreSQL / Supabase connection...");

      const pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false, // Required for Supabase in many environments
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection immediately on heartbeat
      pool.on('error', (err) => {
        console.error('[DB] Unexpected error on idle client', err);
      });

      return drizzlePg(pool, { schema });
    })()
  : (() => {
      console.log("[DB] Initializing LibSQL / Turso connection...");

      const client = createClient({
        url: resolveSqliteUrl(),
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      return drizzleLibsql(client, { schema });
    })();

// Export as any to avoid complex union type issues in consumer routes
export const db: any = internalDb;

export * from "./schema/index.js";
export * from "drizzle-orm";
export { sql, eq, and, or, not, desc, asc, sum, count } from "drizzle-orm";
