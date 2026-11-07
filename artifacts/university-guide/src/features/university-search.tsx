import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getCountryName, universities, type University } from '../catalog';
import { tr, useLanguage } from '../language';

/** Searches the whole catalogue but renders only a short list of matches. */
export function UniversitySearch({ onPick, excludeIds = [], label, testId }: {
  onPick: (university: University) => void;
  excludeIds?: string[];
  label: string;
  testId: string;
}) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (q.length < 2) return [];
    const out: University[] = [];
    for (const item of universities) {
      if (excludeIds.includes(item.id)) continue;
      if (item.name.toLocaleLowerCase().includes(q) || item.country.toLocaleLowerCase().includes(q)) out.push(item);
      if (out.length >= 8) break;
    }
    return out;
  }, [query, excludeIds]);

  return (
    <div className="field uni-search">
      <label htmlFor={testId}>{label}</label>
      <div className="search-input-wrap">
        <Search size={16} aria-hidden="true" />
        <input id={testId} className="control" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={tr(language, 'Начните вводить название вуза', 'Start typing a university name')} data-testid={`input-${testId}`} autoComplete="off" />
      </div>
      {query.trim().length >= 2 && (
        <ul className="search-results" data-testid={`list-${testId}`}>
          {results.length ? results.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => { onPick(item); setQuery(''); }} data-testid={`button-pick-${item.id}`}>
                <strong>{item.name}</strong><span>{getCountryName(item, language)}</span>
              </button>
            </li>
          )) : <li className="search-empty">{tr(language, 'Ничего не найдено', 'No matches')}</li>}
        </ul>
      )}
    </div>
  );
}
