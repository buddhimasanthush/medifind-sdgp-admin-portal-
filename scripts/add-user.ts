import { db, adminsTable } from "../lib/db/src/index.js";

async function main() {
  const email = "buddhimasanthush@gmail.com";
  const employeeId = "ADMIN-001";

  console.log(`Adding admin: ${email}`);
  try {
    await db.insert(adminsTable).values({
      username: email,
      employeeId,
      status: "approved",
    });
    console.log("Admin added successfully!");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('UNIQUE constraint failed') || (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE')) {
        console.log("Admin already exists!");
    } else {
        console.error("Error adding admin:", error);
    }
  }
  process.exit(0);
}

main();
