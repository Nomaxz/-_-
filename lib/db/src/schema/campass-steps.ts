import { pgTable, text, uuid, boolean, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { campassPlans } from './campass-plans';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
export const campassSteps = pgTable('campass_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').notNull().references(() => campassPlans.id, { onDelete: 'cascade' }),
  templateKey: text('template_key'),
  label: text('label').notNull(),
  done: boolean('done').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('campass_steps_plan_idx').on(table.planId)]);
export const insertCampassStepSchema = createInsertSchema(campassSteps).omit({ id: true, createdAt: true });
export type InsertCampassStep = z.infer<typeof insertCampassStepSchema>;
