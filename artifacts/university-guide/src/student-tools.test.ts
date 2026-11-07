import assert from 'node:assert/strict';
import test from 'node:test';
import { fields, levels, programmes, matchesAcademic, universityKey } from '@workspace/campass-data';
import { universities } from './catalog';
import { compareStore } from './features/compare-store';

test('each sampled programme belongs to an exact university and cites a valid source', () => {
  for (const [key, list] of Object.entries(programmes)) {
    assert.ok(universities.some((item) => universityKey(item) === key), key);
    for (const programme of list) {
      assert.ok(programme.title.ru && programme.title.en);
      assert.ok(programme.field in fields && programme.level in levels);
      assert.equal(new URL(programme.source).protocol, 'https:');
    }
  }
});
test('subject and degree filters match the same sourced programme without name inference', () => {
  const sydney = universities.find((item) => item.name === 'University of Sydney')!;
  assert.equal(matchesAcademic(sydney, 'business', 'master'), true);
  assert.equal(matchesAcademic(sydney, 'business', 'bachelor'), false);
  assert.equal(matchesAcademic(sydney, 'technology', 'master'), false);
  const unknown = { name: 'Imaginary Technology University', countryCode: 'ZZ' };
  assert.equal(matchesAcademic(unknown, 'technology'), false);
  assert.equal(matchesAcademic(unknown), true);
});
test('comparison rejects unknowns, repeats and more than four institutions', () => {
  compareStore.clear();
  assert.equal(compareStore.add('not-a-university'), 'exists');
  const distinct = [...new Map(universities.map((item) => [universityKey(item), item])).values()].slice(0, 5);
  for (const item of distinct.slice(0, 4)) assert.equal(compareStore.add(item.id), 'added');
  assert.equal(compareStore.add(distinct[0].id), 'exists');
  assert.equal(compareStore.add(distinct[4].id), 'full');
  compareStore.remove(distinct[1].id);
  assert.equal(compareStore.add(distinct[4].id), 'added');
  compareStore.clear();
});
