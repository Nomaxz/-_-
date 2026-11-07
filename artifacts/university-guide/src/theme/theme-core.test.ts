import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTheme, readStoredTheme, resolveTheme, writeStoredTheme, THEME_STORAGE_KEY } from './theme-core';

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
}
const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };

test('system preference is used without explicit choice', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
});
test('explicit choice overrides system preference', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});
test('storage read validates values and survives failures', () => {
  assert.equal(readStoredTheme(memory({ [THEME_STORAGE_KEY]: 'dark' })), 'dark');
  assert.equal(readStoredTheme(memory({ [THEME_STORAGE_KEY]: 'purple' })), null);
  assert.equal(readStoredTheme(broken), null);
  assert.equal(readStoredTheme(null), null);
  assert.equal(parseTheme(undefined), null);
});
test('storage write round-trips and reports failures', () => {
  const store = memory();
  assert.equal(writeStoredTheme(store, 'light'), true);
  assert.equal(readStoredTheme(store), 'light');
  assert.equal(writeStoredTheme(broken, 'dark'), false);
  assert.equal(writeStoredTheme(null, 'dark'), false);
});
