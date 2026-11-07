import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
export const campassUsers = pgTable('campass_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull(),
  usernameKey: text('username_key').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const insertCampassUserSchema = createInsertSchema(campassUsers).omit({ id: true, createdAt: true });
export type InsertCampassUser = z.infer<typeof insertCampassUserSchema>;
export type CampassUser = typeof campassUsers.$inferSelect;
