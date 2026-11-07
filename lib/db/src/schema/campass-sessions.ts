import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { campassUsers } from './campass-users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
export const campassSessions = pgTable('campass_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: uuid('user_id').notNull().references(() => campassUsers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [index('campass_sessions_user_idx').on(table.userId)]);
export const insertCampassSessionSchema = createInsertSchema(campassSessions);
export type InsertCampassSession = z.infer<typeof insertCampassSessionSchema>;
