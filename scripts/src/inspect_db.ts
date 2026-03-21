import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../lib/db/sqlite.db");

async function main() {
  const client = createClient({
    url: `file:${dbPath}`,
  });

  console.log("Querying notifications...");
  try {
    const result = await client.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;");
    console.log("Recent notifications:");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error querying notifications:", error);
  }
}

main();
