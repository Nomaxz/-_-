import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { and, eq, gt } from 'drizzle-orm';
import { db, campassSessions, campassUsers, type CampassUser } from '@workspace/db';

const COOKIE = 'campass_session';
const TTL = 30 * 24 * 60 * 60 * 1000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
function cookieOptions(req: Request) {
  return {
    httpOnly: true, sameSite: 'lax' as const, path: '/api/campass',
    secure: req.secure || req.get('x-forwarded-proto')?.split(',')[0].trim() === 'https',
  };
}
function tokenFrom(req: Request): string | null {
  const value: unknown = req.cookies?.[COOKIE];
  return typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}
export async function revokeSession(req: Request) {
  const token = tokenFrom(req);
  if (token) await db.delete(campassSessions).where(eq(campassSessions.tokenHash, digest(token)));
}
export function clearSession(req: Request, res: Response) {
  res.clearCookie(COOKIE, cookieOptions(req));
}
export async function createSession(req: Request, res: Response, userId: string) {
  await revokeSession(req);
  const token = randomBytes(32).toString('base64url');
  await db.insert(campassSessions).values({ tokenHash: digest(token), userId, expiresAt: new Date(Date.now() + TTL) });
  res.cookie(COOKIE, token, { ...cookieOptions(req), maxAge: TTL });
}
export async function loadSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = tokenFrom(req);
  if (token) {
    const [row] = await db.select({ user: campassUsers }).from(campassSessions)
      .innerJoin(campassUsers, eq(campassUsers.id, campassSessions.userId))
      .where(and(eq(campassSessions.tokenHash, digest(token)), gt(campassSessions.expiresAt, new Date())));
    res.locals.campassUser = row?.user;
  }
  res.set('Cache-Control', 'no-store');
  next();
}
export function currentUser(res: Response): CampassUser | undefined { return res.locals.campassUser; }
export function requireCampassUser(_req: Request, res: Response, next: NextFunction): void {
  if (!currentUser(res)) { res.status(401).json({ error: 'AUTH_REQUIRED' }); return; }
  next();
}
export function sameOrigin(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) { next(); return; }
  const origin = req.get('origin');
  let allowed = req.get('sec-fetch-site') !== 'cross-site';
  if (origin) {
    try {
      const host = new URL(origin).host;
      allowed = allowed && [req.get('host'), req.get('x-forwarded-host')?.split(',')[0].trim()].includes(host);
    } catch { allowed = false; }
  } else if (req.method !== 'DELETE' && req.path !== '/auth/logout') {
    allowed = allowed && Boolean(req.is('application/json'));
  }
  if (!allowed) { res.status(403).json({ error: 'INVALID_ORIGIN' }); return; }
  next();
}
