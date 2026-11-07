import type { Language } from '../../test-content';

export type LocalizedText = Record<Language, string>;
export type ExamKind = 'secondary' | 'standardized' | 'language' | 'entrance';
export type PriceBand = 'low' | 'medium' | 'high';
export type Insight = {
  tuition: LocalizedText;
  living: LocalizedText;
  admission: LocalizedText;
  funding: LocalizedText;
  exams: ExamKind[];
  priceBand: PriceBand | null;
  approximate: boolean;
  sources: { label: string; url: string }[];
  city?: LocalizedText;
  application?: LocalizedText;
  tuitionSummary?: LocalizedText;
  checkedAt?: string;
};

export type SchoolDetail = Omit<Insight, 'living' | 'approximate'>;
export const text = (ru: string, en: string): LocalizedText => ({ ru, en });
