import { pgTable, text, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { campassUsers } from './campass-users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
export const campassPlans = pgTable('campass_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => campassUsers.id, { onDelete: 'cascade' }),
  universityKey: text('university_key').notNull(),
  programId: text('program_id'),
  programName: text('program_name').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('campass_plans_owner_university').on(table.userId, table.universityKey)]);
export const insertCampassPlanSchema = createInsertSchema(campassPlans).omit({ id: true, createdAt: true });
export type InsertCampassPlan = z.infer<typeof insertCampassPlanSchema>;
