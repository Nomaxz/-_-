import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export function normalizeUsername(username: string) {
  return username.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}
export function validUsername(username: string) {
  return /^[\p{L}\p{N}_-]{3,30}$/u.test(username.normalize('NFKC').trim());
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, Buffer.from(salt, 'hex'), 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [salt, expected] = stored.split(':');
  const actual = await derive(password, Buffer.from(salt, 'hex'), 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
export const dummyPasswordHash = `${'0'.repeat(32)}:${'0'.repeat(128)}`;
