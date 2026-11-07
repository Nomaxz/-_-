import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db, campassFavorites } from '@workspace/db';
import { universityKey } from '@workspace/campass-data';
import { GetCampassFavoritesResponse, SaveCampassFavoriteBody, SaveCampassFavoriteResponse, RemoveCampassFavoriteParams } from '@workspace/api-zod';
import { currentUser, requireCampassUser } from '../middlewares/campass-session';
import { universitiesById, universityFields } from '../lib/campass-catalog';
const router = Router();
router.use('/favorites', requireCampassUser);
const output = (row: typeof campassFavorites.$inferSelect) => ({ ...universityFields(row.universityKey), createdAt: row.createdAt.toISOString() });
router.get('/favorites', async (_req, res): Promise<void> => {
  const rows = await db.select().from(campassFavorites).where(eq(campassFavorites.userId, currentUser(res)!.id)).orderBy(desc(campassFavorites.createdAt));
  res.json(GetCampassFavoritesResponse.parse(rows.map(output)));
});
router.post('/favorites', async (req, res): Promise<void> => {
  const input = SaveCampassFavoriteBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const university = universitiesById.get(input.data.universityId);
  if (!university) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const userId = currentUser(res)!.id, key = universityKey(university);
  await db.insert(campassFavorites).values({ userId, universityKey: key }).onConflictDoNothing();
  const [row] = await db.select().from(campassFavorites).where(and(eq(campassFavorites.userId, userId), eq(campassFavorites.universityKey, key)));
  res.status(201).json(SaveCampassFavoriteResponse.parse(output(row)));
});
router.delete('/favorites/:universityId', async (req, res): Promise<void> => {
  const input = RemoveCampassFavoriteParams.safeParse(req.params);
  const university = input.success ? universitiesById.get(input.data.universityId) : null;
  if (!university) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  await db.delete(campassFavorites).where(and(eq(campassFavorites.userId, currentUser(res)!.id), eq(campassFavorites.universityKey, universityKey(university))));
  res.sendStatus(204);
});
export default router;
