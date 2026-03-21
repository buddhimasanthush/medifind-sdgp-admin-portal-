import { db, adminsTable, pharmaciesTable, patientsTable } from "../lib/db/src/index.ts";

async function main() {
  console.log("Querying all credential tables...");
  try {
    const admins = await db.select().from(adminsTable);
    console.log("Admins:", JSON.stringify(admins.map(a => ({ username: a.username, employeeId: a.employeeId })), null, 2));

    const pharmacies = await db.select().from(pharmaciesTable);
    console.log("Pharmacies:", JSON.stringify(pharmacies.map(p => ({ username: p.username, name: p.name })), null, 2));

    const patients = await db.select().from(patientsTable);
    console.log("Patients:", JSON.stringify(patients.map(p => ({ username: p.username, name: p.name })), null, 2));

  } catch (error) {
    console.error("Error querying tables:", error);
  }
  process.exit(0);
}

main();
