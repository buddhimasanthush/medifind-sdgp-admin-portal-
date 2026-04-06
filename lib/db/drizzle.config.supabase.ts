import { defineConfig } from "drizzle-kit";

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DB_URL or DATABASE_URL is required to push to PostgreSQL.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
    ssl: { rejectUnauthorized: false } as any,
  },
  verbose: true,
  strict: true,
});
