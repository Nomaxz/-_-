import { Router } from 'express';
import { and, desc, eq, inArray, max } from 'drizzle-orm';
import { db, campassPlans, campassSteps } from '@workspace/db';
import { checklistTemplates, universityKey } from '@workspace/campass-data';
import {
  GetCampassPlansResponse, CreateCampassPlanBody, CreateCampassPlanResponse,
  UpdateCampassPlanBody, UpdateCampassPlanParams, UpdateCampassPlanResponse,
  DeleteCampassPlanParams, CreateCampassStepBody, CreateCampassStepParams, CreateCampassStepResponse,
  UpdateCampassStepBody, UpdateCampassStepParams, UpdateCampassStepResponse, DeleteCampassStepParams,
} from '@workspace/api-zod';
import { currentUser, requireCampassUser } from '../middlewares/campass-session';
import { universitiesById, universityFields, validProgram } from '../lib/campass-catalog';
const router = Router();
router.use('/plans', requireCampassUser);
const owner = (userId: string, id: string) => and(eq(campassPlans.userId, userId), eq(campassPlans.id, id));
const stepOutput = (row: typeof campassSteps.$inferSelect) => ({
  id: row.id, label: row.label, done: row.done, templateKey: row.templateKey,
});
async function listPlans(userId: string, id?: string) {
  const rows = await db.select().from(campassPlans)
    .where(id ? owner(userId, id) : eq(campassPlans.userId, userId)).orderBy(desc(campassPlans.createdAt));
  if (!rows.length) return [];
  const steps = await db.select().from(campassSteps)
    .where(inArray(campassSteps.planId, rows.map((row) => row.id)))
    .orderBy(campassSteps.position, campassSteps.createdAt, campassSteps.id);
  return rows.map((row) => ({
    id: row.id, ...universityFields(row.universityKey),
    programId: row.programId, programName: row.programName,
    createdAt: row.createdAt.toISOString(),
    steps: steps.filter((step) => step.planId === row.id).map(stepOutput),
  }));
}
router.get('/plans', async (_req, res): Promise<void> => {
  res.json(GetCampassPlansResponse.parse(await listPlans(currentUser(res)!.id)));
});
router.post('/plans', async (req, res): Promise<void> => {
  const parsed = CreateCampassPlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const university = universitiesById.get(parsed.data.universityId);
  if (!university) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const key = universityKey(university), userId = currentUser(res)!.id;
  const programId = parsed.data.programId?.trim() || null;
  if (!validProgram(key, programId)) { res.status(400).json({ error: 'INVALID_PROGRAM' }); return; }
  const planId = await db.transaction(async (tx) => {
    const [created] = await tx.insert(campassPlans).values({
      userId, universityKey: key, programId, programName: parsed.data.programName?.trim() ?? '',
    }).onConflictDoNothing().returning();
    if (created) {
      await tx.insert(campassSteps).values(checklistTemplates.map((item, position) => ({
        planId: created.id, templateKey: item.key, label: item.label.en, position,
      })));
      return created.id;
    }
    const [existing] = await tx.select().from(campassPlans).where(and(eq(campassPlans.userId, userId), eq(campassPlans.universityKey, key)));
    return existing.id;
  });
  const [plan] = await listPlans(userId, planId);
  res.status(201).json(CreateCampassPlanResponse.parse(plan));
});
router.patch('/plans/:id', async (req, res): Promise<void> => {
  const params = UpdateCampassPlanParams.safeParse(req.params), body = UpdateCampassPlanBody.safeParse(req.body);
  if (!params.success || !body.success || !Object.keys(body.data).length) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const userId = currentUser(res)!.id;
  const [plan] = await db.select().from(campassPlans).where(owner(userId, params.data.id));
  if (!plan) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const programId = body.data.programId === undefined ? plan.programId : body.data.programId?.trim() || null;
  if (!validProgram(plan.universityKey, programId)) { res.status(400).json({ error: 'INVALID_PROGRAM' }); return; }
  await db.update(campassPlans).set({
    programId, programName: body.data.programName?.trim() ?? plan.programName,
  }).where(owner(userId, plan.id));
  const [updated] = await listPlans(userId, plan.id);
  res.json(UpdateCampassPlanResponse.parse(updated));
});
router.delete('/plans/:id', async (req, res): Promise<void> => {
  const params = DeleteCampassPlanParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const removed = await db.delete(campassPlans).where(owner(currentUser(res)!.id, params.data.id)).returning({ id: campassPlans.id });
  if (!removed.length) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.sendStatus(204);
});
router.post('/plans/:id/steps', async (req, res): Promise<void> => {
  const params = CreateCampassStepParams.safeParse(req.params), body = CreateCampassStepBody.safeParse(req.body);
  if (!params.success || !body.success || !body.data.label.trim()) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const [plan] = await db.select().from(campassPlans).where(owner(currentUser(res)!.id, params.data.id));
  if (!plan) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const [last] = await db.select({ position: max(campassSteps.position) }).from(campassSteps).where(eq(campassSteps.planId, plan.id));
  const [step] = await db.insert(campassSteps).values({
    planId: plan.id, label: body.data.label.trim(), position: (last.position ?? 0) + 1,
  }).returning();
  res.status(201).json(CreateCampassStepResponse.parse(stepOutput(step)));
});
router.patch('/plans/:id/steps/:stepId', async (req, res): Promise<void> => {
  const params = UpdateCampassStepParams.safeParse(req.params), body = UpdateCampassStepBody.safeParse(req.body);
  if (!params.success || !body.success || !Object.keys(body.data).length || body.data.label !== undefined && !body.data.label.trim()) {
    res.status(400).json({ error: 'INVALID_INPUT' }); return;
  }
  const [plan] = await db.select().from(campassPlans).where(owner(currentUser(res)!.id, params.data.id));
  if (!plan) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const [step] = await db.update(campassSteps).set({
    ...(body.data.done !== undefined ? { done: body.data.done } : {}),
    ...(body.data.label !== undefined ? { label: body.data.label.trim(), templateKey: null } : {}),
  }).where(and(eq(campassSteps.planId, plan.id), eq(campassSteps.id, params.data.stepId))).returning();
  if (!step) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.json(UpdateCampassStepResponse.parse(stepOutput(step)));
});
router.delete('/plans/:id/steps/:stepId', async (req, res): Promise<void> => {
  const params = DeleteCampassStepParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const [plan] = await db.select().from(campassPlans).where(owner(currentUser(res)!.id, params.data.id));
  if (!plan) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const [step] = await db.delete(campassSteps).where(and(eq(campassSteps.planId, plan.id), eq(campassSteps.id, params.data.stepId))).returning();
  if (!step) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.sendStatus(204);
});
export default router;
