import React from 'react';
import type { Language } from '../test-content';
import { isReviewRatingStale, REVIEW_FRESHNESS_DAYS, type UniversityReputation } from '../university-insights';

const labels = {
  ru: {
    title: 'Оценка отзывов',
    count: 'отзывов',
    checked: 'проверено',
    stale: `Оценка может быть устаревшей: не проверялась более ${REVIEW_FRESHNESS_DAYS} дней`,
  },
  en: {
    title: 'Student review rating',
    count: 'reviews',
    checked: 'checked',
    stale: `Rating may be outdated: not checked for over ${REVIEW_FRESHNESS_DAYS} days`,
  },
};

export function ReviewRating({ reputation, language }: {
  reputation: UniversityReputation;
  language: Language;
}) {
  if (reputation.studentReviewRating === undefined || !reputation.reviewSource) return null;
  const t = labels[language];
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  return (
    <span data-testid="review-rating">
      <strong>{t.title}</strong>: {reputation.studentReviewRating.toFixed(1)}/5
      {' '}<span className="rating-star" aria-hidden="true">★</span>
      {reputation.reviewCount !== undefined && ` · ${new Intl.NumberFormat(locale).format(reputation.reviewCount)} ${t.count}`}
      {' · '}
      <a href={reputation.reviewSource.url} target="_blank" rel="noreferrer">{reputation.reviewSource.label}</a>
      {reputation.reviewCheckedAt && (
        <small> · {t.checked} <time dateTime={reputation.reviewCheckedAt}>{new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${reputation.reviewCheckedAt}T00:00:00Z`))}</time></small>
      )}
      {isReviewRatingStale(reputation.reviewCheckedAt) && (
        <span className="review-stale-warning">
          <span aria-hidden="true">⚠ </span>{t.stale}
        </span>
      )}
    </span>
  );
}
