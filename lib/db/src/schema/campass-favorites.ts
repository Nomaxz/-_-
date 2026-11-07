import { pgTable, text, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { campassUsers } from './campass-users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
export const campassFavorites = pgTable('campass_favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => campassUsers.id, { onDelete: 'cascade' }),
  universityKey: text('university_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('campass_favorites_owner_university').on(table.userId, table.universityKey)]);
export const insertCampassFavoriteSchema = createInsertSchema(campassFavorites).omit({ id: true, createdAt: true });
export type InsertCampassFavorite = z.infer<typeof insertCampassFavoriteSchema>;
