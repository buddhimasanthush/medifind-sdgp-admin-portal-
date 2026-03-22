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

// Support for Turso (Cloud SQLite) or Local SQLite
const tursoUrl = process.env.TURSO_CONNECTION_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

// Local path must be prefixed with file:
const connectionUrl = tursoUrl || `file:${dbPath}`;

const client = createClient({
  url: connectionUrl,
  authToken: tursoToken,
});

export const db = drizzle(client, { schema });
export * from "./schema";
export * from "drizzle-orm";
