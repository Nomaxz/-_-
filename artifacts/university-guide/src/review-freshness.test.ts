import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewRating } from './components/review-rating';
import { isReviewRatingStale, REVIEW_FRESHNESS_DAYS } from './university-insights';

const checkedAt = '2026-11-07';
const day = 86_400_000;
const afterDays = (days: number) => new Date(Date.parse(`${checkedAt}T00:00:00Z`) + days * day);

test('review warning starts only after 180 calendar days', () => {
  assert.equal(REVIEW_FRESHNESS_DAYS, 180);
  for (const days of [0, 1, 179, 180]) {
    assert.equal(isReviewRatingStale(checkedAt, afterDays(days)), false);
  }
  assert.equal(isReviewRatingStale(checkedAt, afterDays(181)), true);
  assert.equal(isReviewRatingStale(checkedAt, afterDays(365)), true);
  const endOfBoundaryDay = new Date(afterDays(181).getTime() - 1);
  assert.equal(isReviewRatingStale(checkedAt, endOfBoundaryDay), false);
});

test('missing, invalid and future dates are not classified as old', () => {
  for (const value of [undefined, '', 'invalid', '2026-02-30', '2026-13-01', '2026-1-01', '2028-01-01']) {
    assert.equal(isReviewRatingStale(value, afterDays(181)), false);
  }
  assert.equal(isReviewRatingStale(checkedAt, new Date('invalid')), false);
});

test('freshness uses UTC calendar dates across timezone and year boundaries', () => {
  assert.equal(isReviewRatingStale(checkedAt, new Date('2027-05-06T23:59:59Z')), false);
  assert.equal(isReviewRatingStale(checkedAt, new Date('2027-05-07T04:00:00+04:00')), true);
});

const warnings = {
  ru: 'Оценка может быть устаревшей: не проверялась более 180 дней',
  en: 'Rating may be outdated: not checked for over 180 days',
};

for (const language of ['ru', 'en'] as const) {
  for (const days of [180, 181]) {
    test(`${language}: day ${days} renders ${days === 180 ? 'no warning' : 'a localized warning'} without hiding the rating or source`, (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: afterDays(days) });
      const html = renderToStaticMarkup(createElement(ReviewRating, {
        language,
        reputation: {
          studentReviewRating: 4.3,
          reviewCount: 59,
          reviewCheckedAt: checkedAt,
          reviewSource: { label: 'Review source', url: 'https://example.com/reviews' },
        },
      }));

      assert.match(html, /4\.3\/5/);
      assert.match(html, /<a href="https:\/\/example.com\/reviews" target="_blank" rel="noreferrer">Review source<\/a>/);
      if (days === 180) {
        assert.doesNotMatch(html, /review-stale-warning/);
        for (const warning of Object.values(warnings)) {
          assert.ok(!html.includes(warning));
        }
      } else {
        assert.ok(html.includes(
          `<span class="review-stale-warning"><span aria-hidden="true">⚠ </span>${warnings[language]}</span>`,
        ));
        assert.ok(!html.includes(warnings[language === 'ru' ? 'en' : 'ru']));
      }
    });
  }
}
