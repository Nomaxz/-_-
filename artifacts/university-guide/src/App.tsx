import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  useRoute,
  useSearch,
  Router as WouterRouter,
} from 'wouter';
import {
  countries,
  getCountryName,
  recommendUniversities,
  universities,
  type University,
} from './catalog';
import {
  questions,
  resultAreas,
  type Language,
  type TestResult,
} from './test-content';

const queryClient = new QueryClient();

const messages = {
  ru: {
    brand: 'путь',
    navUniversities: 'Вузы',
    navCountries: 'Страны',
    navTests: 'Тест интересов',
    switchLanguage: 'Switch to English',
    footer: 'Справочник для первого шага. Условия поступления и стоимость сверяйте на сайте вуза.',
    heroEyebrow: 'Навигатор по высшему образованию',
    heroTitle: 'Найдите университет который подходит вам',
    heroIntro: 'Изучайте университеты и страны, открывайте официальные сайты и проверяйте условия поступления.',
    heroNoteTitle: 'С чего начать',
    heroNote: 'Найдите университет по названию, стране или области. Проверьте детали программы на официальном сайте.',
    catalogTitle: 'Каталог университетов',
    searchLabel: 'Поиск',
    searchPlaceholder: 'Университет, страна или область',
    countryLabel: 'Страна',
    allCountries: 'Все страны',
    priceMinLabel: 'Стоимость от',
    priceMaxLabel: 'Стоимость до',
    pricePlaceholder: 'Введите сумму',
    priceSourceNote: 'В прикреплённом файле нет данных о стоимости. Фильтр будет сравнивать цену только у вузов с указанной стоимостью.',
    reset: 'Сбросить фильтры',
    countSuffix: 'вузов в каталоге',
    sourceLabel: 'Источник данных · прикреплённый каталог',
    priceUnavailable: 'В исходном файле нет цен. Сбросьте ценовой фильтр или добавьте данные о стоимости.',
    emptyHeading: 'Университеты не найдены',
    emptyText: 'Измените поиск или параметры фильтра.',
    showAll: 'Показать все университеты',
    sourceDisclaimer: 'Каталог содержит название вуза, страну, регион, домен и официальный сайт. Стоимость, программы и условия поступления в исходном файле не указаны.',
    countriesEyebrow: 'География обучения',
    countriesTitle: 'Страны для учёбы',
    countriesIntro: 'Выберите страну, чтобы посмотреть университеты из прикреплённого каталога.',
    countrySearch: 'Поиск страны',
    countrySearchPlaceholder: 'Введите название страны',
    countryCountLabel: 'Университетов в каталоге',
    countryLink: 'Показать вузы страны',
    noCountries: 'Страны не найдены',
    backCatalog: 'Назад к каталогу',
    unknownCountry: 'Страна не указана',
    regionLabel: 'Регион',
    requirementsTitle: 'Требования для поступления',
    benefitsTitle: 'Стипендии и преимущества',
    additionalTitle: 'Дополнительная информация',
    missingSourceInfo: 'В прикреплённом файле эти сведения не указаны. Проверьте информацию на официальном сайте университета.',
    directoryDetails: 'Данные из каталога',
    officialWebsite: 'Официальный сайт',
    domains: 'Домены',
    openWebsite: 'Открыть сайт',
    noWebsite: 'Сайт в источнике не указан',
    admissionDisclaimer: 'Источник не содержит стоимость обучения, программы или требования для поступления. Эти данные нужно уточнить у университета.',
    notFound: 'Университет не найден',
    testEyebrow: 'Самопознание · 3 минуты',
    testTitle: 'Выберите направление',
    testIntro: 'Короткий тест поможет наметить области для изучения. Он не является профессиональной диагностикой.',
    questionLabel: 'Вопрос',
    of: 'из',
    back: 'Назад',
    next: 'Далее',
    showResult: 'Показать результат',
    resultHeading: 'Ваш ориентир',
    suggestedFields: 'Подходящие направления',
    recommendationHeading: 'Университеты для изучения',
    recommendationNote: 'Подбор выполнен по словам в названии университета, а не по проверенным программам. Уточните наличие направления на официальном сайте.',
    recommendationEmpty: 'В каталоге не найдено названий с подходящими ключевыми словами.',
    viewDetails: 'Подробнее',
    restartTest: 'Пройти ещё раз',
    testDisclaimer: 'Результат отражает ваши ответы и не заменяет консультацию или самостоятельное изучение программ.',
    notFoundText: 'Такой страницы нет в справочнике.',
    testNotFoundLink: 'Перейти к каталогу',
  },
  en: {
    brand: 'path',
    navUniversities: 'Universities',
    navCountries: 'Countries',
    navTests: 'Interest test',
    switchLanguage: 'Переключить на русский',
    footer: 'A starting-point directory. Confirm admissions requirements and tuition on each university website.',
    heroEyebrow: 'Higher education guide',
    heroTitle: 'Find a university that fits you',
    heroIntro: 'Explore universities and countries, visit official websites, and verify admissions information.',
    heroNoteTitle: 'How to start',
    heroNote: 'Search by university, country, or region. Check program details on the official website.',
    catalogTitle: 'University directory',
    searchLabel: 'Search',
    searchPlaceholder: 'University, country, or region',
    countryLabel: 'Country',
    allCountries: 'All countries',
    priceMinLabel: 'Tuition from',
    priceMaxLabel: 'Tuition up to',
    pricePlaceholder: 'Enter an amount',
    priceSourceNote: 'The attached file has no tuition data. Price filters can only compare universities with a listed tuition amount.',
    reset: 'Reset filters',
    countSuffix: 'universities in directory',
    sourceLabel: 'Data source · attached directory',
    priceUnavailable: 'The source file has no prices. Clear the price filter or add tuition data.',
    emptyHeading: 'No universities found',
    emptyText: 'Change your search or filter settings.',
    showAll: 'Show all universities',
    sourceDisclaimer: 'The directory includes university names, countries, regions, domains, and official websites. It does not include tuition, programs, or admissions requirements.',
    countriesEyebrow: 'Study destinations',
    countriesTitle: 'Countries for study',
    countriesIntro: 'Choose a country to browse universities from the attached directory.',
    countrySearch: 'Search countries',
    countrySearchPlaceholder: 'Enter a country name',
    countryCountLabel: 'Universities in directory',
    countryLink: 'View universities',
    noCountries: 'No countries found',
    backCatalog: 'Back to directory',
    unknownCountry: 'Country not listed',
    regionLabel: 'Region',
    requirementsTitle: 'Admission requirements',
    benefitsTitle: 'Scholarships and benefits',
    additionalTitle: 'Additional information',
    missingSourceInfo: 'This information is not included in the attached file. Check the university website.',
    directoryDetails: 'Directory information',
    officialWebsite: 'Official website',
    domains: 'Domains',
    openWebsite: 'Open website',
    noWebsite: 'No website listed in source',
    admissionDisclaimer: 'The source does not include tuition, programs, or admissions requirements. Confirm these details with the university.',
    notFound: 'University not found',
    testEyebrow: 'Self-reflection · 3 minutes',
    testTitle: 'Explore a direction',
    testIntro: 'This short test can suggest areas to explore. It is not a professional assessment.',
    questionLabel: 'Question',
    of: 'of',
    back: 'Back',
    next: 'Next',
    showResult: 'Show results',
    resultHeading: 'Your starting point',
    suggestedFields: 'Suggested fields',
    recommendationHeading: 'Universities to explore',
    recommendationNote: 'Suggestions are matched by words in university names, not verified programs. Confirm the subject is offered on the official website.',
    recommendationEmpty: 'No university names in the directory matched these keywords.',
    viewDetails: 'View details',
    restartTest: 'Take the test again',
    testDisclaimer: 'This result reflects your answers and does not replace professional guidance or independent program research.',
    notFoundText: 'This page is not in the directory.',
    testNotFoundLink: 'Go to directory',
  },
} as const;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('Language context is missing');
  return context;
}

function formatNumber(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US').format(value);
}

function websiteFor(university: University) {
  return university.websites[0] ?? (university.domains[0] ? `https://${university.domains[0]}` : null);
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = messages[language];
  const isActive = (path: string) => (path === '/' ? location === '/' : location.startsWith(path));

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" data-testid="link-brand">{t.brand}</Link>
        <div className="header-actions">
          <nav className="nav-links" aria-label={language === 'ru' ? 'Основная навигация' : 'Main navigation'}>
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} data-testid="link-catalog">{t.navUniversities}</Link>
            <Link href="/countries" className={`nav-link ${isActive('/countries') ? 'active' : ''}`} data-testid="link-countries">{t.navCountries}</Link>
            <Link href="/tests" className={`nav-link ${isActive('/tests') ? 'active' : ''}`} data-testid="link-tests">{t.navTests}</Link>
          </nav>
          <button
            type="button"
            className="language-toggle"
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            aria-label={t.switchLanguage}
            data-testid="button-language"
          >
            {language === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">{t.footer}</footer>
    </div>
  );
}

function CatalogPage() {
  const searchParams = useSearch();
  const queryCountry = new URLSearchParams(searchParams).get('country') ?? '';
  const { language } = useLanguage();
  const t = messages[language];
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState(queryCountry);
  const [minTuition, setMinTuition] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(24);
  const hasPriceFilter = minTuition !== '' || maxTuition !== '';
  const hasTuitionData = universities.some((university) => university.tuition !== null);

  useEffect(() => setCountry(queryCountry), [queryCountry]);
  useEffect(() => setVisibleLimit(24), [search, country, minTuition, maxTuition]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
    const lower = minTuition === '' ? null : Number(minTuition);
    const upper = maxTuition === '' ? null : Number(maxTuition);
    return universities.filter((university) => {
      const searchText = [
        university.name,
        university.country,
        university.region,
        ...university.domains,
      ].join(' ').toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
      const matchesSearch = !query || searchText.includes(query);
      const matchesCountry = !country || university.country === country;
      const matchesTuition =
        !hasPriceFilter ||
        (university.tuition !== null &&
          (lower === null || university.tuition >= lower) &&
          (upper === null || university.tuition <= upper));
      return matchesSearch && matchesCountry && matchesTuition;
    });
  }, [search, country, minTuition, maxTuition, hasPriceFilter, language]);

  const resetFilters = () => {
    setSearch('');
    setCountry('');
    setMinTuition('');
    setMaxTuition('');
  };

  return (
    <div className="page">
      <section className="catalog-hero">
        <div>
          <div className="eyebrow">{t.heroEyebrow}</div>
          <h1 className="page-title">{t.heroTitle}</h1>
          <p className="intro">{t.heroIntro}</p>
        </div>
        <aside className="hero-note"><strong>{t.heroNoteTitle}</strong><br />{t.heroNote}</aside>
      </section>
      <div className="eyebrow">{t.catalogTitle}</div>
      <div className="filter-panel" aria-label={t.catalogTitle}>
        <div className="field search-wrap">
          <label htmlFor="university-search">{t.searchLabel}</label>
          <Search size={16} aria-hidden="true" />
          <input
            id="university-search"
            className="control"
            type="search"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            data-testid="input-search"
          />
        </div>
        <div className="field">
          <label htmlFor="country-filter">{t.countryLabel}</label>
          <select id="country-filter" className="control" value={country} onChange={(event) => setCountry(event.target.value)} data-testid="select-country">
            <option value="">{t.allCountries}</option>
            {countries.map((item) => <option key={item.id} value={item.name}>{getCountryName(item, language)}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tuition-min">{t.priceMinLabel}</label>
          <input id="tuition-min" className="control" type="number" min="0" step="1" inputMode="decimal" placeholder={t.pricePlaceholder} value={minTuition} onChange={(event) => setMinTuition(event.target.value)} data-testid="input-tuition-min" />
        </div>
        <div className="field">
          <label htmlFor="tuition-max">{t.priceMaxLabel}</label>
          <input id="tuition-max" className="control" type="number" min="0" step="1" inputMode="decimal" placeholder={t.pricePlaceholder} value={maxTuition} onChange={(event) => setMaxTuition(event.target.value)} data-testid="input-tuition-max" />
        </div>
        <button type="button" className="button secondary" onClick={resetFilters} data-testid="button-reset-filters">{t.reset}</button>
        <p className="filter-note">{t.priceSourceNote}</p>
      </div>
      <div className="result-meta">
        <span data-testid="text-result-count">{formatNumber(filtered.length, language)} {t.countSuffix}</span>
        <span>{t.sourceLabel}</span>
      </div>
      {filtered.length ? (
        <>
          <div className="university-list" data-testid="list-universities">
            {filtered.slice(0, visibleLimit).map((university) => <UniversityCard key={university.id} university={university} />)}
          </div>
          {filtered.length > visibleLimit && (
            <div className="load-more-wrap">
              <button type="button" className="button secondary" onClick={() => setVisibleLimit((value) => value + 24)} data-testid="button-load-more">
                {language === 'ru' ? 'Показать ещё' : 'Show more'}
              </button>
              <span>{formatNumber(Math.min(visibleLimit, filtered.length), language)} / {formatNumber(filtered.length, language)}</span>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state" data-testid="empty-universities">
          <h2>{hasPriceFilter && !hasTuitionData ? t.priceUnavailable : t.emptyHeading}</h2>
          <p>{hasPriceFilter && !hasTuitionData ? t.priceSourceNote : t.emptyText}</p>
          <button className="button secondary" type="button" onClick={resetFilters} data-testid="button-empty-reset">{t.showAll}</button>
        </div>
      )}
      <div className="disclaimer">{t.sourceDisclaimer}</div>
    </div>
  );
}

function UniversityCard({ university }: { university: University }) {
  const { language } = useLanguage();
  const t = messages[language];
  const website = websiteFor(university);

  return (
    <article className="uni-card" data-testid={`card-university-${university.id}`}>
      <div>
        <h2><Link href={`/university/${university.id}`}>{university.name}</Link></h2>
        <div className="uni-loc">
          {university.region ? `${university.region}, ` : ''}{getCountryName(university, language)}
        </div>
        {university.domains.length > 0 && <p>{university.domains.join(' · ')}</p>}
        <Link href={`/university/${university.id}`} className="detail-link" data-testid={`link-details-${university.id}`}>{t.viewDetails}</Link>
      </div>
      <div className="uni-aside">
        <span>{t.officialWebsite}</span>
        {website ? (
          <a href={website} target="_blank" rel="noreferrer" className="official-link" data-testid={`link-website-${university.id}`}>
            {t.openWebsite} <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ) : <span>{t.noWebsite}</span>}
      </div>
    </article>
  );
}

function CountriesPage() {
  const { language } = useLanguage();
  const t = messages[language];
  const [search, setSearch] = useState('');
  const visibleCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
    return countries.filter((country) => {
      const localizedName = getCountryName(country, language).toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
      return !query || localizedName.includes(query) || country.name.toLocaleLowerCase().includes(query);
    });
  }, [search, language]);

  return (
    <div className="page">
      <div className="eyebrow">{t.countriesEyebrow}</div>
      <h1 className="page-title">{t.countriesTitle}</h1>
      <p className="intro">{t.countriesIntro}</p>
      <div className="country-search field">
        <label htmlFor="country-search">{t.countrySearch}</label>
        <input id="country-search" className="control" type="search" placeholder={t.countrySearchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-country-search" />
      </div>
      {visibleCountries.length ? (
        <div className="country-grid" data-testid="list-countries">
          {visibleCountries.map((country) => (
            <article className="country-card" key={country.id} data-testid={`card-country-${country.id}`}>
              <h2>{getCountryName(country, language)}</h2>
              <div className="country-count">{t.countryCountLabel}: {formatNumber(country.universityCount, language)}</div>
              <Link href={`/?country=${encodeURIComponent(country.name)}`} className="button secondary" data-testid={`link-country-catalog-${country.id}`}>
                {t.countryLink} <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><h2>{t.noCountries}</h2></div>
      )}
    </div>
  );
}

function UniversityPage() {
  const [, params] = useRoute('/university/:id');
  const { language } = useLanguage();
  const t = messages[language];
  const university = universities.find((item) => item.id === params?.id);
  if (!university) {
    return <div className="page"><div className="empty-state"><h1>{t.notFound}</h1><Link href="/" className="button" data-testid="link-back-catalog">{t.testNotFoundLink}</Link></div></div>;
  }
  const website = websiteFor(university);

  return (
    <div className="page">
      <Link href="/" className="nav-link" data-testid="link-back"><ArrowLeft size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />{t.backCatalog}</Link>
      <header className="detail-head" style={{ marginTop: 20 }}>
        <div className="eyebrow">{getCountryName(university, language)}{university.region ? ` · ${university.region}` : ''}</div>
        <h1 className="page-title">{university.name}</h1>
      </header>
      <div className="detail-columns">
        <div>
          <section className="detail-section"><h2>{t.requirementsTitle}</h2><p>{t.missingSourceInfo}</p></section>
          <section className="detail-section"><h2>{t.benefitsTitle}</h2><p>{t.missingSourceInfo}</p></section>
          <section className="detail-section"><h2>{t.additionalTitle}</h2><p>{t.admissionDisclaimer}</p></section>
        </div>
        <aside>
          <div className="info-box">
            <h2>{t.directoryDetails}</h2>
            <div className="info-row"><span>{t.countryLabel}</span><strong>{getCountryName(university, language)}</strong></div>
            {university.region && <div className="info-row"><span>{t.regionLabel}</span><strong>{university.region}</strong></div>}
            <div className="info-row"><span>{t.domains}</span><strong>{university.domains.join(', ') || t.noWebsite}</strong></div>
            <div className="info-row"><span>{t.officialWebsite}</span><strong>{website ? <a href={website} target="_blank" rel="noreferrer">{t.openWebsite}</a> : t.noWebsite}</strong></div>
          </div>
          <div className="disclaimer">{t.admissionDisclaimer}</div>
        </aside>
      </div>
    </div>
  );
}

function TestPage() {
  const { language } = useLanguage();
  const t = messages[language];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ area: string; details: TestResult } | null>(null);
  const currentQuestion = questions[step];
  const recommendations = useMemo(
    () => result ? recommendUniversities(result.area) : [],
    [result],
  );

  const choose = (optionIndex: number) => setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }));
  const finishTest = () => {
    const scores: Record<string, number> = {};
    questions.forEach((question) => {
      const answerIndex = answers[question.id];
      if (answerIndex !== undefined) {
        Object.entries(question.options[answerIndex].areaScores).forEach(([area, score]) => {
          scores[area] = (scores[area] || 0) + score;
        });
      }
    });
    const winner = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'people';
    setResult({ area: winner, details: resultAreas[winner] });
  };
  const restart = () => { setStep(0); setAnswers({}); setResult(null); };

  return (
    <div className="page">
      <div className="eyebrow">{t.testEyebrow}</div>
      <h1 className="page-title">{t.testTitle}</h1>
      <p className="intro">{t.testIntro}</p>
      <section className="test-card" aria-live="polite">
        {!result ? (
          <>
            <div className="test-progress" aria-label={`${t.questionLabel} ${step + 1} ${t.of} ${questions.length}`}>
              {questions.map((question, index) => <span key={question.id} className={`progress-segment ${index <= step ? 'filled' : ''}`} />)}
            </div>
            <div className="question-count" data-testid="text-question-step">{t.questionLabel} {step + 1} {t.of} {questions.length}</div>
            <h2 className="question-title">{currentQuestion.prompt[language]}</h2>
            <div className="option-list">
              {currentQuestion.options.map((option, index) => (
                <button
                  type="button"
                  key={option.label.en}
                  className={`option-button ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                  onClick={() => choose(index)}
                  aria-pressed={answers[currentQuestion.id] === index}
                  data-testid={`button-answer-${currentQuestion.id}-${index}`}
                >
                  <span className="radio-dot" aria-hidden="true" />{option.label[language]}
                </button>
              ))}
            </div>
            <div className="test-actions">
              <button type="button" className="button secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} data-testid="button-test-back">{t.back}</button>
              {step < questions.length - 1 ? (
                <button type="button" className="button" disabled={answers[currentQuestion.id] === undefined} onClick={() => setStep((value) => value + 1)} data-testid="button-test-next">{t.next} <ArrowRight size={15} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} /></button>
              ) : (
                <button type="button" className="button" disabled={answers[currentQuestion.id] === undefined} onClick={finishTest} data-testid="button-test-result">{t.showResult}</button>
              )}
            </div>
          </>
        ) : (
          <div className="result-panel" data-testid="panel-test-result">
            <div className="eyebrow">{t.resultHeading}</div>
            <h2>{result.details.title[language]}</h2>
            <p>{result.details.description[language]}</p>
            <h3 className="field-label">{t.suggestedFields}</h3>
            <div className="field-pills">{result.details.suggestedFields[language].map((field) => <span key={field}>{field}</span>)}</div>
            <h3 className="recommendation-title">{t.recommendationHeading}</h3>
            {recommendations.length ? (
              <div className="recommendation-list" data-testid="list-test-recommendations">
                {recommendations.map((university) => (
                  <div className="recommendation-item" key={university.id} data-testid={`recommendation-${university.id}`}>
                    <div>
                      <Link href={`/university/${university.id}`} className="recommendation-name">{university.name}</Link>
                      <div className="uni-loc">{getCountryName(university, language)}</div>
                    </div>
                    {websiteFor(university) && <a href={websiteFor(university)!} target="_blank" rel="noreferrer" aria-label={`${t.openWebsite}: ${university.name}`}><ArrowUpRight size={18} /></a>}
                  </div>
                ))}
              </div>
            ) : <p>{t.recommendationEmpty}</p>}
            <p className="recommendation-note">{t.recommendationNote}</p>
            <p className="test-disclaimer">{t.testDisclaimer}</p>
            <button type="button" className="button secondary" onClick={restart} data-testid="button-test-restart">{t.restartTest}</button>
          </div>
        )}
      </section>
    </div>
  );
}

function NotFoundPage() {
  const { language } = useLanguage();
  const t = messages[language];
  return <div className="page"><div className="empty-state"><h1>{t.notFound}</h1><p>{t.notFoundText}</p><Link href="/" className="button" data-testid="link-not-found-home">{t.testNotFoundLink}</Link></div></div>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={CatalogPage} />
          <Route path="/countries" component={CountriesPage} />
          <Route path="/university/:id" component={UniversityPage} />
          <Route path="/tests" component={TestPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('university-guide-language') === 'en' ? 'en' : 'ru';
    } catch {
      return 'ru';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('university-guide-language', language);
    } catch {
      // The language toggle still works if browser storage is unavailable.
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageContext.Provider>
  );
}

export default App;
