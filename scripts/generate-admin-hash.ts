import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

async function generateHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as any;
  const hash = `${salt}:${derivedKey.toString("hex")}`;
  console.log("\n--- GENERATED CREDENTIALS ---");
  console.log(`Password: ${password}`);
  console.log(`Hash for DB: ${hash}`);
  console.log("-----------------------------\n");
  
  console.log("SQL TO RUN IN SUPABASE:");
  console.log(`UPDATE admins SET password_hash = '${hash}', status = 'approved' WHERE username = 'admin';`);
}

generateHash("admin123");
