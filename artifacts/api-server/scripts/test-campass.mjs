// Integration verification against the running dev proxy. Creates only unique
// disposable test accounts and deletes only their own rows in finally.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db, pool, campassUsers, campassSessions } from '@workspace/db';
import { eq, inArray } from 'drizzle-orm';
import { universitiesById } from '../src/lib/campass-catalog.ts';

const base = 'http://localhost:80/api/campass';
const created = [];
const password = randomUUID() + 'Aa!';
async function request(path, method = 'GET', data, cookie = '', origin = 'http://localhost') {
  const res = await fetch(base + path, {
    method, headers: { ...(data !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), origin },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, body, headers: res.headers };
}
try {
  assert.equal((await request('/favorites')).status, 401);
  const nameA = `api_${randomUUID().slice(0, 8)}`, nameB = `api_${randomUUID().slice(0, 8)}`;
  const a = await request('/auth/register', 'POST', { username: nameA, password });
  assert.equal(a.status, 201);
  created.push(a.body.id);
  const cookieA = a.headers.get('set-cookie').split(';')[0];
  assert.match(a.headers.get('set-cookie'), /HttpOnly/);
  assert.match(a.headers.get('set-cookie'), /SameSite=Lax/i);
  assert.equal(a.body.passwordHash, undefined);
  const [stored] = await db.select().from(campassUsers).where(eq(campassUsers.id, a.body.id));
  assert.notEqual(stored.passwordHash, password);
  const sessions = await db.select().from(campassSessions).where(eq(campassSessions.userId, a.body.id));
  assert.ok(sessions.every((row) => !cookieA.includes(row.tokenHash)));
  assert.equal((await request('/auth/register', 'POST', { username: nameA.toUpperCase(), password })).status, 409);
  assert.equal((await request('/auth/login', 'POST', { username: nameA, password: 'definitely-wrong' })).status, 401);
  assert.equal((await request('/favorites', 'POST', { universityId: 'university-0' }, cookieA, 'https://evil.example')).status, 403);
  assert.equal((await request('/favorites', 'POST', { universityId: 'not-an-id' }, cookieA)).status, 404);
  const university = [...universitiesById.values()].find((item) => item.name === 'University of Oxford');
  assert.ok(university);
  for (let i = 0; i < 2; i++) assert.equal((await request('/favorites', 'POST', { universityId: university.id }, cookieA)).status, 201);
  assert.equal((await request('/favorites', 'GET', undefined, cookieA)).body.length, 1);
  assert.equal((await request('/plans', 'POST', { universityId: university.id, programId: 'wrong-school-program' }, cookieA)).status, 400);
  const planResponse = await request('/plans', 'POST', { universityId: university.id, programId: 'oxford-cs-ba' }, cookieA);
  assert.equal(planResponse.status, 201);
  const plan = planResponse.body;
  assert.equal(plan.steps.length, 6);
  const stepId = plan.steps[0].id;
  assert.equal((await request(`/plans/${plan.id}/steps/${stepId}`, 'PATCH', { done: true }, cookieA)).body.done, true);
  const duplicate = await request('/plans', 'POST', { universityId: university.id }, cookieA);
  assert.equal(duplicate.body.id, plan.id);
  assert.equal(duplicate.body.steps.find((step) => step.id === stepId).done, true);
  const custom = await request(`/plans/${plan.id}/steps`, 'POST', { label: 'Integration test personal item' }, cookieA);
  assert.equal(custom.status, 201);
  assert.equal((await request(`/plans/${plan.id}/steps/${custom.body.id}`, 'PATCH', { label: 'Updated personal item', done: true }, cookieA)).status, 200);
  const updated = await request(`/plans/${plan.id}`, 'PATCH', { programId: null, programName: 'My personal programme' }, cookieA);
  assert.equal(updated.status, 200);
  assert.equal(updated.body.steps.find((step) => step.id === stepId).done, true);
  const b = await request('/auth/register', 'POST', { username: nameB, password });
  assert.equal(b.status, 201);
  created.push(b.body.id);
  const cookieB = b.headers.get('set-cookie').split(';')[0];
  assert.deepEqual((await request('/plans', 'GET', undefined, cookieB)).body, []);
  assert.deepEqual((await request('/favorites', 'GET', undefined, cookieB)).body, []);
  assert.equal((await request(`/plans/${plan.id}`, 'PATCH', { programName: 'forbidden' }, cookieB)).status, 404);
  assert.equal((await request(`/plans/${plan.id}/steps/${stepId}`, 'PATCH', { done: false }, cookieB)).status, 404);
  assert.equal((await request(`/plans/${plan.id}`, 'DELETE', undefined, cookieB)).status, 404);
  assert.equal((await request(`/plans/${plan.id}/steps/${custom.body.id}`, 'DELETE', undefined, cookieA)).status, 204);
  assert.equal((await request('/auth/logout', 'POST', undefined, cookieA)).status, 204);
  assert.equal((await request('/favorites', 'GET', undefined, cookieA)).status, 401);
  const login = await request('/auth/login', 'POST', { username: nameA, password });
  assert.equal(login.status, 200);
  const cookieNew = login.headers.get('set-cookie').split(';')[0];
  const persisted = (await request('/plans', 'GET', undefined, cookieNew)).body[0];
  assert.equal(persisted.steps.find((step) => step.id === stepId).done, true);
  assert.equal(persisted.programName, 'My personal programme');
  assert.equal((await request(`/favorites/${university.id}`, 'DELETE', undefined, cookieNew)).status, 204);
  assert.equal((await request(`/plans/${plan.id}`, 'DELETE', undefined, cookieNew)).status, 204);
  assert.deepEqual((await request('/plans', 'GET', undefined, cookieNew)).body, []);
  console.info('PASS: registration, password protection, cookie sessions, CSRF, favorites, checklist CRUD, persistence and cross-account isolation');
} finally {
  if (created.length) await db.delete(campassUsers).where(inArray(campassUsers.id, created));
  await pool.end();
}
