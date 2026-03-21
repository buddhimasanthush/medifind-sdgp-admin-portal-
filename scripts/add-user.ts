import { db, usersTable } from "../lib/db/src/index.ts";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const username = "admin";
  const password = "password123";
  const passwordHash = await hashPassword(password);

  console.log(`Adding user: ${username}`);
  try {
    await db.insert(usersTable).values({
      username,
      passwordHash,
    });
    console.log("User added successfully!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
  process.exit(0);
}

main();
