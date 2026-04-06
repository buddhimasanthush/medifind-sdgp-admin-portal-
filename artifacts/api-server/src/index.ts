import "dotenv/config";
import { db, sql } from "@workspace/db";
import app from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function probeDatabaseConnection(): Promise<void> {
  const database = db as any;

  if (typeof database.execute !== "function") {
    console.warn(
      "[DB] Skipping startup probe: current database client does not expose execute().",
    );
    return;
  }

  try {
    await database.execute(sql`SELECT 1`);
    console.log("Database connected successfully");
  } catch (err: any) {
    console.error("Database connection failed:", err?.message ?? err);
  }
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  void probeDatabaseConnection();
});
