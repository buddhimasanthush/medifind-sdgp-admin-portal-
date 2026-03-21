import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminsTable = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  employeeId: text("employee_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertAdminSchema = createInsertSchema(adminsTable).omit({ id: true, createdAt: true });
export const selectAdminSchema = createSelectSchema(adminsTable);

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = z.infer<typeof selectAdminSchema>;
