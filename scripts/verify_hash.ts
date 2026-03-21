import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = "8b3238618a804473"; // Fixed salt from seed.ts
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const pass = "admin123";
  const hash = await hashPassword(pass);
  console.log(`Hash of ${pass} is ${hash}`);
}

main();
