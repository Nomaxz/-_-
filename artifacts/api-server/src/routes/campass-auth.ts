import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, campassUsers, type CampassUser } from '@workspace/db';
import { GetCampassMeResponse, RegisterCampassBody, RegisterCampassResponse, LoginCampassBody, LoginCampassResponse } from '@workspace/api-zod';
import { createSession, clearSession, currentUser, revokeSession } from '../middlewares/campass-session';
import { authRateLimit } from '../middlewares/campass-rate-limit';
import { dummyPasswordHash, hashPassword, normalizeUsername, validUsername, verifyPassword } from '../lib/campass-password';
const router = Router();
const publicUser = (user: CampassUser) => ({ id: user.id, username: user.username, createdAt: user.createdAt.toISOString() });
router.get('/auth/me', (_req, res) => {
  const user = currentUser(res);
  res.json(GetCampassMeResponse.parse({ user: user ? publicUser(user) : null }));
});
router.post('/auth/register', authRateLimit, async (req, res): Promise<void> => {
  const parsed = RegisterCampassBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const { username, password } = parsed.data;
  if (!validUsername(username)) { res.status(400).json({ error: 'INVALID_USERNAME' }); return; }
  const key = normalizeUsername(username);
  const hash = await hashPassword(password);
  const [user] = await db.insert(campassUsers).values({
    username: username.normalize('NFKC').trim(), usernameKey: key, passwordHash: hash,
  }).onConflictDoNothing().returning();
  if (!user) { res.status(409).json({ error: 'USERNAME_TAKEN' }); return; }
  await createSession(req, res, user.id);
  res.status(201).json(RegisterCampassResponse.parse(publicUser(user)));
});
router.post('/auth/login', authRateLimit, async (req, res): Promise<void> => {
  const parsed = LoginCampassBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
  const [user] = await db.select().from(campassUsers).where(eq(campassUsers.usernameKey, normalizeUsername(parsed.data.username)));
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummyPasswordHash);
  if (!user || !valid) { res.status(401).json({ error: 'BAD_CREDENTIALS' }); return; }
  await createSession(req, res, user.id);
  res.json(LoginCampassResponse.parse(publicUser(user)));
});
router.post('/auth/logout', async (req, res): Promise<void> => {
  await revokeSession(req);
  clearSession(req, res);
  res.sendStatus(204);
});
export default router;
