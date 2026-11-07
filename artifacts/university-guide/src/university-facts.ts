import data from './data/university-facts.json';
import { universities, type University } from './catalog';

export type UniversityFacts = {
  source: string;
  sourceName: string;
  countryCode: string;
  cities: string[];
  established?: number;
  names?: { ru?: string; en?: string };
  status: string;
  sourceUpdatedAt: string;
  matchMethod: string;
};

const facts: Readonly<Record<string, UniversityFacts>> = data.institutions;
export const registryCoverage = universities.filter((item) => getUniversityFacts(item)).length;
export const registryImportedAt = data.importedAt;
export const registryRelease = data.release;

export function getUniversityFacts(university: University): UniversityFacts | null {
  return facts[`${university.countryCode}:${university.name}`] ?? null;
}
