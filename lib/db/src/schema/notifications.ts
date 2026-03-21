import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // e.g., 'new_employee_signup'
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  metadata: text("metadata"), // JSON string for extra data
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export const selectNotificationSchema = createSelectSchema(notificationsTable);

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
