import assert from 'node:assert/strict';
import { test } from 'node:test';
import { universities } from './catalog';
import {
  getUniversityReputation,
  universityReputationByName,
  type UniversityReputation,
} from './university-insights';

function assertSource(
  source: UniversityReputation['qsSource'],
  context: string,
) {
  assert.ok(source, `${context}: a metric-specific source is required`);
  assert.ok(source.label.trim(), `${context}: source label must not be blank`);
  assert.equal(source.url, source.url.trim(), `${context}: URL must not contain surrounding whitespace`);
  const url = new URL(source.url); // Reject malformed or relative links.
  assert.ok(['http:', 'https:'].includes(url.protocol), `${context}: source must be an HTTP(S) link`);
  assert.ok(url.hostname, `${context}: source must have a hostname`);
  assert.ok(!url.username && !url.password, `${context}: source must not contain credentials`);
}

// Iterate over the mapping, not the catalog: otherwise orphaned/misspelled
// mapping keys would never be checked.
test('reputation mappings are present and match exact catalog names', () => {
  assert.ok(Object.keys(universityReputationByName).length > 0);
  const names = new Set(universities.map((university) => university.name));
  for (const name of Object.keys(universityReputationByName)) {
    assert.ok(names.has(name), `${name}: no exact catalog-name match`);
    const university = universities.find((item) => item.name === name)!;
    assert.equal(getUniversityReputation(university), universityReputationByName[name]);
  }
});

for (const [name, reputation] of Object.entries(universityReputationByName)) {
  test(`${name}: every QS rank is a positive integer with a named QS link`, () => {
    if (reputation.qs2027Rank === undefined) return;
    assert.ok(Number.isSafeInteger(reputation.qs2027Rank) && reputation.qs2027Rank > 0,
      `${name}: QS rank must be a positive integer`);
    assertSource(reputation.qsSource, `${name}: QS rank`);
    assert.match(reputation.qsSource!.label, /\bQS\b/i, `${name}: source must identify QS`);
  });

  test(`${name}: every student rating is within 0–5 with its own review link`, () => {
    if (reputation.studentReviewRating === undefined) return;
    assert.ok(Number.isFinite(reputation.studentReviewRating) &&
      reputation.studentReviewRating >= 0 && reputation.studentReviewRating <= 5,
    `${name}: student rating must be a finite number within 0–5`);
    // A QS source cannot substitute for a missing review source.
    assertSource(reputation.reviewSource, `${name}: student reviews`);
  });

  test(`${name}: optional review counts are valid and belong to a rating`, () => {
    if (reputation.reviewCount === undefined) return;
    assert.notEqual(reputation.studentReviewRating, undefined, `${name}: review count needs a rating`);
    assert.ok(Number.isSafeInteger(reputation.reviewCount) && reputation.reviewCount >= 0,
      `${name}: review count must be a non-negative integer`);
  });
}

test('source checks reject absent, blank, malformed and unsafe references', () => {
  for (const source of [
    undefined,
    { label: ' ', url: 'https://example.com/reviews' },
    { label: 'Reviews', url: '' },
    { label: 'Reviews', url: '/reviews' },
    { label: 'Reviews', url: 'not a URL' },
    { label: 'Reviews', url: 'javascript:alert(1)' },
    { label: 'Reviews', url: 'ftp://example.com/reviews' },
    { label: 'Reviews', url: 'https://user:password@example.com/reviews' },
  ]) {
    assert.throws(() => assertSource(source, 'fixture'));
  }
});

test('rank-only, review-only and unrated catalog entries remain supported', () => {
  assertSource({ label: 'QS', url: 'https://example.com/ranking' }, 'rank-only fixture');
  const reviewOnly = Object.values(universityReputationByName).find(
    (entry) => entry.studentReviewRating !== undefined && entry.qs2027Rank === undefined,
  );
  assert.ok(reviewOnly, 'review-only institutions must not require an invented QS rank');
  const unrated = universities.find((entry) => !Object.hasOwn(universityReputationByName, entry.name));
  assert.ok(unrated);
  assert.equal(getUniversityReputation(unrated), null);
});
