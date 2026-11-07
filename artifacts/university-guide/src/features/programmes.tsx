import { getProgrammes, levels, fields, programmes } from '@workspace/campass-data';
import { ArrowUpRight } from 'lucide-react';
import type { University } from '../catalog';
import { tr, useLanguage } from '../language';

export const programmeCoverage = {
  programmes: Object.values(programmes).reduce((sum, list) => sum + list.length, 0),
  universities: Object.keys(programmes).length,
};

export function ProgrammeList({ university, compact = false }: { university: University; compact?: boolean }) {
  const { language } = useLanguage();
  const list = getProgrammes(university);
  if (!list.length) {
    return <p className="muted-line">{tr(language, 'Программы этого вуза пока не добавлены в выборку. Это не значит, что их нет — проверьте официальный сайт.', 'No programmes from this university are in our sample yet. That does not mean none exist — check the official website.')}</p>;
  }
  return (
    <ul className={`programme-list ${compact ? 'compact' : ''}`}>
      {list.map((item) => (
        <li key={item.id} data-testid={`programme-${item.id}`}>
          <a href={item.source} target="_blank" rel="noreferrer">{item.title[language]} <ArrowUpRight size={13} aria-hidden="true" /></a>
          {!compact && <span>{fields[item.field][language]} · {levels[item.level][language]}</span>}
        </li>
      ))}
    </ul>
  );
}

export function ProgrammeSection({ university }: { university: University }) {
  const { language } = useLanguage();
  return (
    <section className="detail-section" data-testid="section-programmes">
      <h2>{tr(language, 'Известные программы', 'Known programmes')}</h2>
      <ProgrammeList university={university} />
      <p className="muted-note">{tr(language,
        `Небольшая выборка: ${programmeCoverage.programmes} программ у ${programmeCoverage.universities} вузов, каждая найдена на сайте вуза. Список неполный.`,
        `Small sample: ${programmeCoverage.programmes} programmes at ${programmeCoverage.universities} universities, each found on an institution website. The list is incomplete.`)}</p>
    </section>
  );
}
