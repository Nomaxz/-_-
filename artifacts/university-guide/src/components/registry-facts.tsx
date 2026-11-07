import type { UniversityFacts } from '../university-facts';
import { registryImportedAt } from '../university-facts';
import type { Language } from '../test-content';

export function RegistryFacts({ facts, language }: { facts: UniversityFacts; language: Language }) {
  const ru = language === 'ru';
  const date = (value: string) => new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en-GB', { timeZone: 'UTC' }).format(new Date(value));
  return (
    <section className="detail-section" data-testid="section-registry-facts">
      <h2>{ru ? 'Найденные сведения об университете' : 'Available university facts'}</h2>
      <p><strong>{ru ? 'Название в реестре' : 'Registry name'}:</strong> {facts.names?.[language] ?? facts.sourceName}</p>
      {facts.cities.length > 0 && <p><strong>{ru ? 'Города в реестре' : 'Cities in the registry'}:</strong> {facts.cities.join(', ')}</p>}
      {facts.established && <p><strong>{ru ? 'Год основания по реестру' : 'Established according to the registry'}:</strong> {facts.established}</p>}
      {facts.status !== 'active' && <p className="disclaimer">{ru ? 'Запись ROR помечена как неактивная или выведенная из реестра. Возможны реорганизация или переименование — проверьте текущее название и статус на сайте учреждения.' : 'The ROR record is inactive or withdrawn. The institution may have reorganised or changed its name; verify its current identity and status on its website.'}</p>}
      <p><a href={facts.source} target="_blank" rel="noreferrer">Research Organization Registry — ROR</a></p>
      <p className="muted-note">
        {ru ? 'Обновление записи источником' : 'Registry record updated'}: <time dateTime={facts.sourceUpdatedAt}>{date(facts.sourceUpdatedAt)}</time>
        {' · '}{ru ? 'Загружено в каталог' : 'Imported into the directory'}: <time dateTime={registryImportedAt}>{date(registryImportedAt)}</time>
      </p>
      <p className="muted-note">{ru ? 'Это справочные данные реестра, а не проверка стоимости, аккредитации или условий поступления. Найденные отдельные сведения не означают, что карточка заполнена полностью.' : 'Registry metadata does not verify tuition, accreditation or admissions. Having some sourced facts does not mean the profile is complete.'}</p>
    </section>
  );
}
