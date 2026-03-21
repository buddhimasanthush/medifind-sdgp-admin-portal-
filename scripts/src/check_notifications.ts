import { db, notificationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

async function main() {
  console.log("Querying recent notifications...");
  try {
    const notifications = await db.select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(10);
    console.log("Recent notifications:");
    console.log(JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error("Error querying notifications:", error);
  }
  process.exit(0);
}

main();
