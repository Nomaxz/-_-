import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, X } from 'lucide-react';
import { getCountryName, universities, type University } from '../catalog';
import { tr, useLanguage } from '../language';
import { COMPARE_MAX, COMPARE_MIN, compareStore, useCompareIds } from '../features/compare-store';
import { UniversitySearch } from '../features/university-search';
import { ProgrammeList } from '../features/programmes';
import { useToast } from '@/hooks/use-toast';
import {
  examOptions,
  getCountryLivingCost,
  getTuitionSummary,
  getUniversityInsight,
  getUniversityReputation,
} from '../university-insights';

const byId = new Map(universities.map((item) => [item.id, item]));

export function ComparePage() {
  const { language } = useLanguage();
  const ids = useCompareIds();
  const { toast } = useToast();
  const selected = ids.map((id) => byId.get(id)).filter((item): item is University => Boolean(item));
  const unknown = <span className="unknown">{tr(language, 'Нет проверенных сведений', 'No verified information')}</span>;

  const rows: { label: string; render: (u: University) => ReactNode }[] = [
    { label: tr(language, 'Достоверность', 'Data accuracy'), render: (u) => {
      const insight = getUniversityInsight(u);
      if (!insight) return <span className="data-badge">{tr(language, 'Без метки', 'No label')}</span>;
      return <span className={`data-badge ${insight.approximate ? 'approximate' : 'verified'}`}>{insight.approximate ? tr(language, 'Неполные или приблизительные сведения', 'Partial or approximate information') : tr(language, 'Проверено по вузу', 'University source')}</span>;
    } },
    { label: tr(language, 'Стоимость обучения', 'Tuition'), render: (u) => {
      const summary = getTuitionSummary(u, language);
      const insight = getUniversityInsight(u);
      if (!summary && !insight) return unknown;
      return <>{summary && <strong className="cell-strong">{summary}</strong>}{insight && <p>{insight.tuition[language]}</p>}</>;
    } },
    { label: tr(language, 'Жизнь в месяц без жилья', 'Monthly living excl. housing'), render: (u) => getCountryLivingCost(u.countryCode, language) ?? unknown },
    { label: tr(language, 'Требования, язык и экзамены', 'Requirements, language and exams'), render: (u) => {
      const insight = getUniversityInsight(u);
      if (!insight || !insight.admission[language] && !insight.exams.length) return unknown;
      return <>
        <p>{insight.admission[language]}</p>
        {insight.exams.length > 0 && <div className="tags">{insight.exams.map((e) => <span key={e} className="tag">{examOptions.find((o) => o.value === e)?.label[language] ?? e}</span>)}</div>}
      </>;
    } },
    { label: tr(language, 'Стипендии', 'Scholarships'), render: (u) => getUniversityInsight(u)?.funding[language] || unknown },
    { label: tr(language, 'Подача и сроки', 'Application and deadlines'), render: (u) => getUniversityInsight(u)?.application?.[language] ?? unknown },
    { label: tr(language, 'Рейтинг', 'Rating'), render: (u) => {
      const rep = getUniversityReputation(u);
      if (!rep) return unknown;
      return <>
        {rep.qs2027Rank !== undefined && rep.qsSource && <p>QS 2027: #{rep.qs2027Rank} · <a href={rep.qsSource.url} target="_blank" rel="noreferrer">{rep.qsSource.label}</a></p>}
        {rep.studentReviewRating !== undefined && rep.reviewSource && <p>{tr(language, 'Отзывы', 'Reviews')}: {rep.studentReviewRating.toFixed(1)}/5 <span className="rating-star" aria-hidden="true">★</span> · <a href={rep.reviewSource.url} target="_blank" rel="noreferrer">{rep.reviewSource.label}</a></p>}
      </>;
    } },
    { label: tr(language, 'Известные программы', 'Known programmes'), render: (u) => <ProgrammeList university={u} compact /> },
    { label: tr(language, 'Источники', 'Sources'), render: (u) => {
      const insight = getUniversityInsight(u);
      const site = u.websites[0] ?? (u.domains[0] ? `https://${u.domains[0]}` : null);
      return <ul className="source-list">
        {insight?.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
        {site && <li><a href={site} target="_blank" rel="noreferrer">{tr(language, 'Официальный сайт', 'Official website')}</a></li>}
        {!insight?.sources.length && !site && <li>{unknown}</li>}
      </ul>;
    } },
  ];

  return (
    <div className="page">
      <div className="eyebrow">{tr(language, 'Сравнение', 'Comparison')}</div>
      <h1 className="page-title">{tr(language, 'Сравнить университеты', 'Compare universities')}</h1>
      <p className="intro">{tr(language, 'От 2 до 4 вузов рядом. Неизвестное остаётся неизвестным: мы не пересчитываем валюты и не придумываем баллы или суммы на жильё.', 'Two to four universities side by side. Unknown stays unknown: we do not convert currencies or invent scores or housing costs.')}</p>

      <div className="compare-bar" data-testid="compare-bar">
        <strong data-testid="text-compare-count">{tr(language, 'Выбрано', 'Selected')}: {selected.length} / {COMPARE_MAX}</strong>
        <div className="compare-chips">
          {selected.map((u) => (
            <span key={u.id} className="compare-chip">
              {u.name}
              <button type="button" onClick={() => compareStore.remove(u.id)} aria-label={tr(language, `Убрать ${u.name}`, `Remove ${u.name}`)} data-testid={`button-remove-compare-${u.id}`}><X size={13} /></button>
            </span>
          ))}
        </div>
        {selected.length > 0 && <button type="button" className="button secondary" onClick={() => compareStore.clear()} data-testid="button-clear-compare">{tr(language, 'Очистить', 'Clear')}</button>}
      </div>

      {selected.length < COMPARE_MAX ? (
        <UniversitySearch label={tr(language, 'Добавить вуз в сравнение', 'Add a university to compare')} testId="compare-search" excludeIds={ids}
          onPick={(u) => { if (compareStore.add(u.id) === 'full') toast({ title: tr(language, 'Максимум 4 вуза', 'Maximum 4 universities') }); }} />
      ) : <p className="coverage-note">{tr(language, 'Достигнут максимум — 4 вуза. Уберите один, чтобы добавить другой.', 'Maximum of 4 reached. Remove one to add another.')}</p>}

      {selected.length < COMPARE_MIN ? (
        <div className="empty-state" data-testid="empty-compare">
          <h2>{selected.length === 0 ? tr(language, 'Сравнение пока пустое', 'Nothing to compare yet') : tr(language, 'Добавьте ещё один вуз', 'Add one more university')}</h2>
          <p>{tr(language, `Нужно минимум ${COMPARE_MIN}. Нажимайте «Сравнить» в каталоге или найдите вуз выше.`, `At least ${COMPARE_MIN} are needed. Press “Compare” in the directory or search above.`)}</p>
          <Link href="/" className="button secondary" data-testid="link-compare-catalog">{tr(language, 'Открыть каталог', 'Open directory')}</Link>
        </div>
      ) : (
        <div className="compare-scroll">
          <table className="compare-table" data-testid="table-compare">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">{tr(language, 'Параметр', 'Field')}</span></th>
                {selected.map((u) => (
                  <th key={u.id} scope="col">
                    <Link href={`/university/${u.id}`} className="recommendation-name">{u.name}</Link>
                    <div className="uni-loc">{getCountryName(u, language)}</div>
                    <button type="button" className="link-button" onClick={() => compareStore.remove(u.id)} data-testid={`button-th-remove-${u.id}`}>{tr(language, 'Убрать', 'Remove')}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {selected.map((u) => <td key={u.id}>{row.render(u)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="disclaimer">{tr(language, 'Суммы показаны в исходной валюте источника. Перед подачей проверьте всё на официальном сайте.', 'Amounts are shown in the source currency. Confirm everything on the official website before applying.')} <ArrowUpRight size={12} aria-hidden="true" /></div>
    </div>
  );
}
