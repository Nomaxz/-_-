import type { Request, Response, NextFunction } from 'express';
const counters = new Map<string, { count: number; until: number }>();
function increment(key: string, limit: number, now: number) {
  if (counters.size >= 10000) {
    for (const [k, value] of counters) if (value.until <= now) counters.delete(k);
    if (counters.size >= 10000 && !counters.has(key)) return false;
  }
  const old = counters.get(key);
  const value = old && old.until > now ? old : { count: 0, until: now + 15 * 60 * 1000 };
  value.count++;
  counters.set(key, value);
  return value.count <= limit;
}
export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? 'unknown';
  const username = typeof req.body?.username === 'string' ? req.body.username.normalize('NFKC').trim().toLowerCase().slice(0, 100) : '';
  const now = Date.now();
  if (!increment(`ip:${ip}`, 60, now) || !increment(`name:${username}`, 20, now)) {
    res.set('Retry-After', '900').status(429).json({ error: 'RATE_LIMITED' }); return;
  }
  next();
}
