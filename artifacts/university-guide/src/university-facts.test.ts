import assert from 'node:assert/strict';
import test from 'node:test';
import { universities } from './catalog';
import { getUniversityFacts, registryCoverage, registryImportedAt, registryRelease } from './university-facts';
import { getTuitionSummary, getUniversityInsight } from './university-insights';
import { additionalCountryGuides } from './data/country-guides';

test('bulk factual metadata enriches thousands of exact catalog entries across the world', () => {
  const enriched = universities.filter((item) => getUniversityFacts(item));
  assert.ok(registryCoverage > 6000);
  assert.ok(enriched.length >= registryCoverage);
  assert.ok(new Set(enriched.map((item) => item.countryCode)).size > 150);
  assert.match(registryRelease, /^10\.5281\/zenodo\.\d+$/);
  for (const university of enriched) {
    const facts = getUniversityFacts(university)!;
    assert.equal(facts.countryCode, university.countryCode);
    assert.match(facts.source, /^https:\/\/ror\.org\/0[a-z0-9]{8}$/);
    assert.ok(facts.sourceName.trim());
    assert.ok(facts.cities.every((city) => city.trim().length > 0));
    assert.ok(['active', 'inactive', 'withdrawn'].includes(facts.status));
    assert.match(facts.sourceUpdatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Date.parse(facts.sourceUpdatedAt) <= Date.parse(registryImportedAt));
    if (facts.established !== undefined) {
      assert.ok(Number.isInteger(facts.established) && facts.established > 0 && facts.established <= new Date().getUTCFullYear());
    }
  }
});

test('registry matching cannot leak facts between same-named institutions in different countries', () => {
  const known = universities.find((item) => getUniversityFacts(item))!;
  assert.equal(getUniversityFacts({ ...known, countryCode: 'ZZ' }), null);
  assert.equal(getUniversityFacts({ ...known, name: `${known.name} Unmatched campus` }), null);
});

test('metadata does not fabricate tuition, exams, requirements or verified status', () => {
  const university = universities.find((item) => item.countryCode === 'IN' && getUniversityFacts(item))!;
  const insight = getUniversityInsight(university)!;
  assert.equal(insight.approximate, true);
  assert.equal(insight.priceBand, null);
  assert.deepEqual(insight.exams, []);
  assert.equal(insight.admission.ru, '');
  assert.equal(insight.funding.en, '');
  assert.equal(insight.checkedAt, undefined);
  assert.equal(getTuitionSummary(university, 'ru'), null);
  assert.equal(universities.filter((item) => getUniversityInsight(item)?.approximate === false).length, 30);
});

test('unmatched catalog entries remain visible with explicit unknowns rather than made-up numbers', () => {
  const university = universities.find((item) => !getUniversityFacts(item) && item.countryCode === 'IN')!;
  assert.ok(university);
  const insight = getUniversityInsight(university)!;
  assert.equal(insight.approximate, true);
  assert.equal(insight.priceBand, null);
  assert.equal(insight.admission.ru, '');
  assert.equal(getTuitionSummary(university, 'en'), null);
  assert.equal(getUniversityFacts(university), null);
});

test('partial national guides only fill available fields and never claim school verification', () => {
  for (const [code, guide] of Object.entries(additionalCountryGuides)) {
    const university = universities.find((item) => item.countryCode === code)!;
    assert.ok(university, code);
    const insight = getUniversityInsight(university)!;
    assert.equal(insight.approximate, true, code);
    assert.equal(insight.priceBand, null, code);
    for (const language of ['ru', 'en'] as const) {
      assert.equal(insight.tuition[language], guide.tuition?.[language], code);
      assert.equal(getTuitionSummary(university, language), guide.tuitionSummary?.[language], code);
      if (!guide.admission) assert.equal(insight.admission[language], '', code);
      if (!guide.funding) assert.equal(insight.funding[language], '', code);
    }
    assert.ok(insight.sources.length > 0, code);
    assert.ok(insight.sources.every((source) => new URL(source.url).protocol === 'https:'), code);
  }
});
