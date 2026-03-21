import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pharmaciesTable = sqliteTable("pharmacies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  location: text("location").notNull(),
  contactEmail: text("contact_email").notNull(),
  phone: text("phone").notNull(),
  licenseExpiry: text("license_expiry").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("pending"),
  dateApplied: text("date_applied").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPharmacySchema = createInsertSchema(pharmaciesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmaciesTable.$inferSelect;
