import assert from 'node:assert/strict';
import test from 'node:test';
import { universities } from '../../catalog';
import { getTuitionSummary, getUniversityInsight } from '../../university-insights';
import { additionalSchoolDetails } from './index';

test('all added profiles match exact catalogue institutions in the five target countries', () => {
  assert.equal(Object.keys(additionalSchoolDetails).length, 20);
  const counts: Record<string, number> = {};
  for (const name of Object.keys(additionalSchoolDetails)) {
    const matches = universities.filter((university) => university.name === name);
    assert.equal(matches.length, 1, name);
    const code = matches[0].countryCode;
    counts[code] = (counts[code] ?? 0) + 1;
  }
  assert.deepEqual(counts, { DE: 4, IT: 4, CA: 4, US: 4, NO: 4 });
});

test('institution-specific data and search prices override country estimates in both languages', () => {
  for (const [name, profile] of Object.entries(additionalSchoolDetails)) {
    const university = universities.find((item) => item.name === name)!;
    const insight = getUniversityInsight(university);
    assert.ok(insight, name);
    assert.equal(insight.approximate, false, name);
    assert.deepEqual(insight.sources, profile.sources, name);
    assert.equal(insight.checkedAt, profile.checkedAt, name);
    for (const language of ['ru', 'en'] as const) {
      for (const field of ['tuition', 'tuitionSummary', 'admission', 'funding', 'application', 'city'] as const) {
        assert.ok(profile[field]?.[language].trim(), `${name}: ${field} ${language}`);
      }
      assert.equal(getTuitionSummary(university, language), profile.tuitionSummary?.[language], name);
      assert.equal(insight.application?.[language], profile.application?.[language], name);
    }
  }
});

test('every new profile has verification metadata and valid named HTTPS sources', () => {
  for (const [name, profile] of Object.entries(additionalSchoolDetails)) {
    assert.match(profile.checkedAt ?? '', /^\d{4}-\d{2}-\d{2}$/, name);
    assert.ok(Number.isFinite(Date.parse(profile.checkedAt!)), name);
    assert.ok(profile.sources.length >= 2, name);
    for (const source of profile.sources) {
      assert.ok(source.label.trim(), name);
      assert.equal(new URL(source.url).protocol, 'https:', name);
    }
  }
});

test('verified coverage includes the original ten and the twenty new profiles', () => {
  const verified = universities.filter((university) => {
    const insight = getUniversityInsight(university);
    return insight && !insight.approximate;
  });
  assert.equal(verified.length, 30);
  assert.ok(verified.some((university) => university.name === 'Harvard University'));
});

test('universities without individual research keep the country estimate label', () => {
  for (const code of ['DE', 'IT', 'CA', 'US', 'NO']) {
    const university = universities.find((item) => item.countryCode === code && getUniversityInsight(item)?.approximate);
    assert.ok(university, code);
    const insight = getUniversityInsight(university);
    assert.equal(insight?.approximate, true, code);
    assert.equal(insight?.checkedAt, undefined, code);
    assert.equal(insight?.city, undefined, code);
  }
});

test('no budget segment is invented for programme ranges with unknown classification', () => {
  for (const name of ['University of Ottawa', 'University of Alberta', 'University of Bergen', 'University of Turin']) {
    const university = universities.find((item) => item.name === name)!;
    assert.equal(getUniversityInsight(university)?.priceBand, null, name);
  }
});
