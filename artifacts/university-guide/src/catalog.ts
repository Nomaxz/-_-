import sourceRows from '../../../attached_assets/world_universities_and_domains_1793783307017.json';

type SourceUniversity = {
  name?: string;
  country?: string;
  domains?: string[];
  web_pages?: string[];
  alpha_two_code?: string;
  'state-province'?: string | null;
};

export type University = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  domains: string[];
  websites: string[];
  tuition: number | null;
};

export type Country = {
  id: string;
  name: string;
  countryCode: string;
  universityCount: number;
};

const rows = sourceRows as unknown as SourceUniversity[];

export const universities: University[] = rows
  .filter((row) => row.name && row.country)
  .map((row, index) => ({
    id: `university-${index}`,
    name: row.name!.trim(),
    country: row.country!.trim(),
    countryCode: row.alpha_two_code?.trim().toUpperCase() ?? '',
    region: row['state-province']?.trim() ?? '',
    domains: (row.domains ?? []).filter(Boolean),
    websites: (row.web_pages ?? []).filter((url) => /^https?:\/\//i.test(url)),
    // The uploaded directory does not include tuition data.
    tuition: null,
  }));

const countryMap = new Map<string, Country>();
for (const university of universities) {
  const key = university.country.toLocaleLowerCase();
  const country = countryMap.get(key);
  if (country) {
    country.universityCount += 1;
  } else {
    const id = key
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-') || university.countryCode || 'country';
    countryMap.set(key, {
      id,
      name: university.country,
      countryCode: university.countryCode,
      universityCount: 1,
    });
  }
}

export const countries = [...countryMap.values()].sort(
  (a, b) => b.universityCount - a.universityCount || a.name.localeCompare(b.name),
);

export function getCountryName(country: Country | University, language: 'ru' | 'en') {
  const fallback = 'universityCount' in country ? country.name : country.country;
  if (!country.countryCode || country.countryCode.length !== 2) return fallback;
  try {
    return (
      new Intl.DisplayNames([language], { type: 'region' }).of(country.countryCode) ??
      fallback
    );
  } catch {
    return fallback;
  }
}

export function getSortedCountries(language: 'ru' | 'en'): Country[] {
  const collator = new Intl.Collator(language);
  return [...countries].sort((a, b) =>
    collator.compare(getCountryName(a, language), getCountryName(b, language)),
  );
}

const recommendationKeywords: Record<string, string[]> = {
  technology: ['technology', 'technical', 'engineering', 'polytechnic', 'computer', 'informatics'],
  people: ['psychology', 'social work', 'sociology', 'education', 'humanities', 'health'],
  creative: ['art', 'design', 'architecture', 'media', 'film', 'music', 'creative'],
  science: ['science', 'research', 'mathematics', 'biology', 'chemistry', 'physics', 'natural'],
  business: ['business', 'economics', 'management', 'commerce', 'finance', 'entrepreneur'],
  communication: ['communication', 'journalism', 'linguistics', 'language', 'media', 'cultural'],
};

export function recommendUniversities(area: string) {
  const keywords = recommendationKeywords[area] ?? [];
  return universities
    .map((university) => {
      const name = ` ${university.name
        .toLocaleLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()} `;
      const score = keywords.reduce(
        (total, keyword) => total + Number(name.includes(` ${keyword} `)),
        0,
      );
      return { university, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.university.name.localeCompare(b.university.name),
    )
    .slice(0, 4)
    .map(({ university }) => university);
}
