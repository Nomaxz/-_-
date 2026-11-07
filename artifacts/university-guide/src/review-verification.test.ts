import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewRating } from './components/review-rating';
import { universityReputationByName, type UniversityReputation } from './university-insights';
import { reviewHistory, type Observation } from './test-fixtures/review-history';

function assertDate(date: string | undefined, context: string) {
  assert.match(date ?? '', /^\d{4}-\d{2}-\d{2}$/, `${context}: verification date required (YYYY-MM-DD)`);
  const parsed = new Date(`${date}T00:00:00Z`);
  assert.ok(Number.isFinite(parsed.getTime()), `${context}: invalid date`);
  assert.equal(parsed.toISOString().slice(0, 10), date, `${context}: invalid calendar date`);
  assert.ok(date! <= new Date().toISOString().slice(0, 10), `${context}: future verification date`);
}

function assertObservation(current: UniversityReputation, history: Observation[], context: string) {
  assertDate(current.reviewCheckedAt, context);
  assert.ok(history?.length, `${context}: append an independently verified observation to review-history.ts`);
  for (let i = 0; i < history.length; i++) {
    const [date, rating, count] = history[i];
    assertDate(date, context);
    if (i > 0) {
      const [previousDate, previousRating, previousCount] = history[i - 1];
      assert.ok(date >= previousDate, `${context}: verification date moved backwards`);
      if (rating !== previousRating || count !== previousCount) {
        assert.ok(date > previousDate, `${context}: changed rating/count requires a newer verification date`);
      }
    }
  }
  const [date, rating, count] = history.at(-1)!;
  if (current.studentReviewRating !== rating || current.reviewCount !== count) {
    assert.ok(current.reviewCheckedAt! > date,
      `${context}: changed rating/count requires a newer verification date`);
  }
  assert.deepEqual(
    [current.reviewCheckedAt, current.studentReviewRating, current.reviewCount],
    [date, rating, count],
    `${context}: append the verified date, rating and count to review-history.ts; preserve previous observations`,
  );
}

test('every published review matches its dated verification history', () => {
  for (const [name, reputation] of Object.entries(universityReputationByName)) {
    if (reputation.studentReviewRating !== undefined) {
      assertObservation(reputation, reviewHistory[name], name);
    }
  }
});

const original: UniversityReputation = {
  studentReviewRating: 4.3, reviewCount: 59, reviewCheckedAt: '2026-01-01',
  reviewSource: { label: 'Review source', url: 'https://example.com/reviews' },
};
const history: Observation[] = [['2026-01-01', 4.3, 59]];

test('rating/count changes cannot reuse a date, including subsequent updates', () => {
  for (const change of [
    { studentReviewRating: 4.4 }, { reviewCount: 60 }, { reviewCount: undefined },
  ]) {
    const changed = { ...original, ...change };
    assert.throws(() => assertObservation(changed, history, 'fixture'), /newer verification date/);
    const sameDate: Observation[] = [...history, ['2026-01-01', changed.studentReviewRating!, changed.reviewCount]];
    assert.throws(() => assertObservation(changed, sameDate, 'fixture'), /newer verification date/);
    const updated = { ...changed, reviewCheckedAt: '2026-01-02' };
    const updatedHistory: Observation[] = [...history, ['2026-01-02', updated.studentReviewRating!, updated.reviewCount]];
    assert.doesNotThrow(() => assertObservation(updated, updatedHistory, 'fixture'));
    assert.throws(() => assertObservation({ ...updated, studentReviewRating: 4.8 }, updatedHistory, 'fixture'), /newer verification date/);
  }
});

test('missing, malformed, impossible, future and backwards dates fail', () => {
  for (const date of [undefined, '', 'bad', '2026-1-01', '2026-02-30', '9999-01-01', '2025-12-31']) {
    assert.throws(() => assertObservation({ ...original, reviewCheckedAt: date }, history, 'fixture'));
  }
  assert.doesNotThrow(() => assertObservation(original, history, 'fixture'));
  assert.doesNotThrow(() => assertObservation({ ...original, qs2027Rank: 1 }, history, 'fixture'));
  assert.throws(() => assertObservation(original, [], 'fixture'), /observation/);
});

for (const language of ['ru', 'en'] as const) {
  test(`${language}: rating, count, source and localized verification date share one rendered block`, () => {
    const html = renderToStaticMarkup(createElement(ReviewRating, { reputation: original, language }));
    assert.ok(html.startsWith('<span data-testid="review-rating">'));
    assert.match(html, /4\.3\/5/);
    assert.match(html, language === 'ru' ? /59 отзывов/ : /59 reviews/);
    assert.match(html, /href="https:\/\/example.com\/reviews"/);
    assert.match(html, language === 'ru'
      ? /проверено <time dateTime="2026-01-01">1 янв\. 2026 г\.<\/time>/
      : /checked <time dateTime="2026-01-01">Jan 1, 2026<\/time>/);
    const updated = renderToStaticMarkup(createElement(ReviewRating, {
      reputation: { ...original, studentReviewRating: 4.5, reviewCount: 60, reviewCheckedAt: '2026-02-02' }, language,
    }));
    assert.match(updated, /4\.5\/5/);
    assert.match(updated, language === 'ru' ? /60 отзывов/ : /60 reviews/);
    assert.match(updated, /dateTime="2026-02-02"/);
    assert.doesNotMatch(updated, /2026-01-01|4\.3\/5|59 /);
    const noCount = renderToStaticMarkup(createElement(ReviewRating, {
      reputation: { ...original, reviewCount: undefined }, language,
    }));
    assert.match(noCount, /<time /);
    assert.doesNotMatch(noCount, /59 /);
    assert.equal(renderToStaticMarkup(createElement(ReviewRating, { reputation: {}, language })), '');
    assert.equal(renderToStaticMarkup(createElement(ReviewRating, {
      reputation: { ...original, reviewSource: undefined }, language,
    })), '');
  });
}
