import rows from '../../../../attached_assets/world_universities_and_domains_1793783307017.json';
import { getProgrammes, universityKey } from '@workspace/campass-data';
type Row = { name?: string; country?: string; alpha_two_code?: string };
const catalogue = (rows as Row[]).filter((row) => row.name && row.country).map((row, index) => ({
  id: `university-${index}`,
  name: row.name!.trim(),
  countryCode: row.alpha_two_code?.trim().toUpperCase() ?? '',
}));
export const universitiesById = new Map(catalogue.map((item) => [item.id, item]));
export const universitiesByKey = new Map(catalogue.map((item) => [universityKey(item), item]));
export function universityFields(key: string) {
  const university = universitiesByKey.get(key);
  if (!university) throw new Error('University missing from catalog');
  return { universityId: university.id, universityName: university.name, countryCode: university.countryCode };
}
export function validProgram(key: string, id: string | null | undefined) {
  const university = universitiesByKey.get(key);
  return !id || Boolean(university && getProgrammes(university).some((program) => program.id === id));
}
