import assert from 'node:assert/strict';
import { test } from 'node:test';
import { universities } from './catalog';
import { getUniversityReputation, sortUniversities } from './university-insights';

test('QS comparison includes only sourced ranks in ascending numeric order', () => {
  const result = sortUniversities(universities, 'qs-rank');
  assert.ok(result.length > 1 && result.length < universities.length);
  assert.equal(result[0].name, 'Massachusetts Institute of Technology');
  for (const [index, university] of result.entries()) {
    const reputation = getUniversityReputation(university)!;
    assert.ok(reputation.qsSource);
    assert.ok(reputation.qs2027Rank! > 0);
    if (index) assert.ok(getUniversityReputation(result[index - 1])!.qs2027Rank! <= reputation.qs2027Rank!);
  }
});

test('review comparison includes review-only universities and sorts highest first', () => {
  const result = sortUniversities(universities, 'review-rating');
  assert.ok(result.length > 1 && result.length < universities.length);
  assert.ok(result.some((university) => university.name === 'Freie Universität Berlin'));
  assert.ok(!sortUniversities(result, 'qs-rank').some((university) => university.name === 'Freie Universität Berlin'));
  for (const [index, university] of result.entries()) {
    const reputation = getUniversityReputation(university)!;
    assert.ok(reputation.reviewSource);
    assert.ok(reputation.studentReviewRating! > 0);
    if (index) assert.ok(getUniversityReputation(result[index - 1])!.studentReviewRating! >= reputation.studentReviewRating!);
  }
});

test('comparisons preserve country and search filtering and handle no matches', () => {
  const matching = universities.filter((university) =>
    university.countryCode === 'DE' && university.name.toLowerCase().includes('berlin'));
  for (const mode of ['qs-rank', 'review-rating'] as const) {
    const result = sortUniversities(matching, mode);
    assert.ok(result.length > 0);
    assert.ok(result.every((university) => matching.includes(university)));
    assert.deepEqual(sortUniversities([], mode), []);
  }
});

test('default order restores all entries, does not mutate input and preserves ties', () => {
  const input = universities.filter((university) => university.countryCode === 'DE');
  const original = [...input];
  sortUniversities(input, 'qs-rank');
  sortUniversities(input, 'review-rating');
  const result = sortUniversities(input, 'default');
  assert.equal(result.length, input.length);
  assert.deepEqual(input, original);
  const tied = universities.filter((university) =>
    ['University of Bologna', 'University of British Columbia'].includes(university.name));
  assert.equal(tied.length, 2);
  assert.deepEqual(sortUniversities(tied, 'review-rating'), tied);
});
