import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword, normalizeUsername, validUsername } from './campass-password';
test('passwords are salted slow hashes and verification rejects incorrect passwords', async () => {
  const password = 'OnlyForThisUnitTest!';
  const first = await hashPassword(password), second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.ok(!first.includes(password));
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword('wrong-password', first), false);
  assert.equal(await verifyPassword(password, 'malformed'), false);
});
test('usernames use a canonical identity while permitting Cyrillic', () => {
  assert.equal(normalizeUsername('  Student_Name  '), 'student_name');
  assert.equal(validUsername('Студент_2026'), true);
  assert.equal(validUsername('a'), false);
  assert.equal(validUsername('<script>'), false);
  assert.equal(validUsername('user name'), false);
});
