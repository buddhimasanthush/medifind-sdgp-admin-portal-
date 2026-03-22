import { db, adminsTable, eq } from "../../lib/db/src/index.ts";
import { hashPassword } from "../../artifacts/api-server/src/lib/hash.ts";
import { sql } from "drizzle-orm";

async function fixPostgresAdminTable() {
  console.log("Checking and fixing Postgres Admin Table...");

  const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!supabaseUrl && !supabaseUrl?.includes("supabase")) {
    console.error("This script is intended for Supabase (Postgres). Please set SUPABASE_DB_URL or DATABASE_URL.");
    return;
  }

  try {
    // 1. Add 'status' column if it's missing (Postgres specific SQL)
    console.log("Adding 'status' column if missing...");
    await db.execute(sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`);
    
    // 2. Make the first admin 'approved' if it was just added or is pending
    console.log("Ensuring 'admin' user is 'approved'...");
    await db.update(adminsTable)
      .set({ status: 'approved' })
      .where(eq(adminsTable.username, 'admin'));

    // 3. Fix plain text passwords
    console.log("Fetching admins to check for plain text passwords...");
    const admins = await db.select().from(adminsTable);
    
    for (const admin of admins) {
      if (!admin.passwordHash.includes(":")) {
        console.log(`Hashing plain text password for user: ${admin.username}`);
        const newHash = await hashPassword(admin.passwordHash);
        await db.update(adminsTable)
          .set({ passwordHash: newHash })
          .where(eq(adminsTable.id, admin.id));
      }
    }

    console.log("Fix complete!");
  } catch (error) {
    console.error("Error during fix:", error);
  }
}

fixPostgresAdminTable().then(() => process.exit(0));
