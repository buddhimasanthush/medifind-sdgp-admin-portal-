import "dotenv/config";
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

import { db, sql } from "@workspace/db";

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Test DB connection on startup
  db.execute(sql`SELECT 1`)
    .then(() => console.log('✅ Database connected successfully'))
    .catch((err: any) => console.error('❌ Database connection failed:', err.message));
});
