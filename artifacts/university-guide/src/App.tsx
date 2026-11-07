import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { fields, levels, matchesAcademic, type Field, type Level } from '@workspace/campass-data';
import { LanguageProvider, useLanguage } from './language';
import { useSession } from './features/session';
import { useCompareIds } from './features/compare-store';
import { UniversityActions } from './features/university-actions';
import { ProgrammeSection, programmeCoverage } from './features/programmes';
import { ComparePage } from './pages/compare';
import { AdmissionsPage } from './pages/admissions';
import { ProfilePage } from './pages/profile';
import { AuthPage } from './pages/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { getUniversityFacts, registryCoverage } from './university-facts';
import { RegistryFacts } from './components/registry-facts';
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
  getSortedCountries,
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
import {
  examOptions,
  getCountryLivingCost,
  getUniversityReputation,
  getTuitionSummary,
  getUniversityInsight,
  priceOptions,
  sortUniversities,
  type ExamFilter,
  type UniversitySort,
  isReviewRatingStale,
  REVIEW_FRESHNESS_DAYS,
} from './university-insights';

const queryClient = new QueryClient();

const messages = {
  ru: {
    brand: 'Campass',
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
    sortLabel: 'Сортировка',
    sortDefault: 'По умолчанию',
    sortQs: 'QS 2027: лучшие места',
    sortReviews: 'Отзывы: высокая оценка',
    sortQsNote: 'Показаны только вузы с подтверждённым местом QS 2027, от меньшего номера к большему.',
    sortReviewsNote: 'Показаны только вузы с подтверждённой оценкой отзывов, от высокой к низкой. Оценка отзывов не является академическим рейтингом.',
    priceMinLabel: 'Стоимость от',
    priceMaxLabel: 'Стоимость до',
    pricePlaceholder: 'Введите сумму',
    priceSourceNote: 'Выберите примерный годовой диапазон в эквиваленте USD. Для пяти стран он основан на официальных данных отдельных вузов и страновых ориентирах.',
    examFilterLabel: 'Уровень экзаменов',
    anyExam: 'Любой уровень',
    anyPrice: 'Любой бюджет',
    dataAccuracyLabel: 'Достоверность данных',
    allDataAccuracy: 'Все сведения',
    verifiedOnly: 'Проверено по вузу',
    approximateOnly: 'Неточно',
    unlabeledOnly: 'Без метки',
    dataEstimate: 'Неполные или приблизительные сведения',
    dataVerified: 'Проверено по вузу',
    countryEstimateNote: 'Карточка заполнена частично. Общие ориентиры по стране не являются подтверждёнными условиями конкретного вуза. Разделы без найденных сведений не заполняются догадками.',
    checkedAtLabel: 'Сведения о вузе проверены',
    applicationTitle: 'Подача заявления и сроки',
    cityLabel: 'Город или кампус',
    detailCoverageLabel: 'Карточек со сведениями из источников вузов во всём каталоге',
    registryCoverageLabel: 'Дополнены найденными сведениями ROR',
    registryBadge: 'Есть сведения ROR',
    establishedLabel: 'Основан',
    tuitionTitle: 'Стоимость обучения',
    tuitionUnavailableShort: 'Уточните стоимость на сайте вуза',
    livingUnavailableShort: 'Нет оценки для этой страны',
    qsRankingLabel: 'Рейтинг QS, выпуск 2027',
    studentReviewsLabel: 'Оценка отзывов',
    reviewCountSuffix: 'отзывов',
    reviewCheckedLabel: 'проверено',
    reviewStaleWarning: `Оценка может быть устаревшей: не проверялась более ${REVIEW_FRESHNESS_DAYS} дней`,
    livingTitle: 'Проживание без жилья',
    livingExcludingHousingNote: 'Примерная сумма на месяц, без оплаты жилья; обучение считается отдельно.',
    sourcesTitle: 'Официальные источники',
    genericInfo: 'Подтверждённые сведения пока не добавлены. Уточните условия программы на официальном сайте.',
    reset: 'Сбросить фильтры',
    countSuffix: 'вузов в каталоге',
    sourceLabel: 'Источник данных · прикреплённый каталог',
    priceUnavailable: 'По выбранному диапазону нет вузов с доступными оценками.',
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
    directoryDetails: 'Расположение и сайт',
    officialWebsite: 'Официальный сайт',
    openWebsite: 'Открыть сайт',
    noWebsite: 'Сайт в источнике не указан',
    admissionDisclaimer: 'Стоимость и требования могут меняться по программе, гражданству и учебному году. Перед подачей проверьте официальный источник.',
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
    brand: 'Campass',
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
    sortLabel: 'Sort by',
    sortDefault: 'Default order',
    sortQs: 'QS 2027: best rank first',
    sortReviews: 'Reviews: highest rated first',
    sortQsNote: 'Only universities with a sourced QS 2027 rank are shown, from lowest rank number to highest.',
    sortReviewsNote: 'Only universities with a sourced review rating are shown, from highest to lowest. Student reviews are not an academic ranking.',
    priceMinLabel: 'Tuition from',
    priceMaxLabel: 'Tuition up to',
    pricePlaceholder: 'Enter an amount',
    priceSourceNote: 'Choose an approximate annual range in USD equivalent. For five countries, this uses official university figures and country-level guides.',
    examFilterLabel: 'Exam level',
    anyExam: 'Any exam level',
    anyPrice: 'Any budget',
    dataAccuracyLabel: 'Data accuracy',
    allDataAccuracy: 'All information',
    verifiedOnly: 'Verified',
    approximateOnly: 'Partial and approximate',
    unlabeledOnly: 'No label',
    dataEstimate: 'Partial or approximate information',
    dataVerified: 'University source',
    countryEstimateNote: 'This profile is partial. Country guides are not verified conditions for this institution. Sections without available information are not filled with guesses.',
    checkedAtLabel: 'University information checked',
    applicationTitle: 'Application process and deadlines',
    cityLabel: 'City or campus',
    detailCoverageLabel: 'Profiles with institution-specific sources across the directory',
    registryCoverageLabel: 'Enriched with available ROR metadata',
    registryBadge: 'ROR facts available',
    establishedLabel: 'Established',
    tuitionTitle: 'Tuition',
    tuitionUnavailableShort: 'Confirm tuition on the university website',
    livingUnavailableShort: 'No estimate available for this country',
    qsRankingLabel: 'QS 2027 edition rank',
    studentReviewsLabel: 'Student review rating',
    reviewCountSuffix: 'reviews',
    reviewCheckedLabel: 'checked',
    reviewStaleWarning: `Rating may be outdated: not checked for over ${REVIEW_FRESHNESS_DAYS} days`,
    livingTitle: 'Living expenses excluding housing',
    livingExcludingHousingNote: 'Approximate monthly expenses, excluding housing; tuition is separate.',
    sourcesTitle: 'Official sources',
    genericInfo: 'Confirmed information has not yet been added. Check course requirements on the official website.',
    reset: 'Reset filters',
    countSuffix: 'universities in directory',
    sourceLabel: 'Data source · attached directory',
    priceUnavailable: 'No universities with available estimates match this range.',
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
    directoryDetails: 'Location and website',
    officialWebsite: 'Official website',
    openWebsite: 'Open website',
    noWebsite: 'No website listed in source',
    admissionDisclaimer: 'Tuition and requirements vary by program, citizenship, and academic year. Confirm them on the official source before applying.',
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


function formatNumber(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US').format(value);
}

function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`));
}

function websiteFor(university: University) {
  return university.websites[0] ?? (university.domains[0] ? `https://${university.domains[0]}` : null);
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = messages[language];
  const isActive = (path: string) => (path === '/' ? location === '/' : location.startsWith(path));
  const { user, isLoading } = useSession();
  const compareCount = useCompareIds().length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" data-testid="link-brand">{t.brand}</Link>
        <div className="header-actions">
          <nav className="nav-links" aria-label={language === 'ru' ? 'Основная навигация' : 'Main navigation'}>
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} data-testid="link-catalog">{t.navUniversities}</Link>
            <Link href="/countries" className={`nav-link ${isActive('/countries') ? 'active' : ''}`} data-testid="link-countries">{t.navCountries}</Link>
            <Link href="/tests" className={`nav-link ${isActive('/tests') ? 'active' : ''}`} data-testid="link-tests">{t.navTests}</Link>
            <Link href="/compare" className={`nav-link ${isActive('/compare') ? 'active' : ''}`} data-testid="link-compare">{language === 'ru' ? 'Сравнение' : 'Compare'}{compareCount > 0 && <span className="nav-count" data-testid="text-nav-compare-count">{compareCount}</span>}</Link>
            <Link href="/admissions" className={`nav-link ${isActive('/admissions') ? 'active' : ''}`} data-testid="link-admissions">{language === 'ru' ? 'Поступление' : 'Admissions'}</Link>
            {isLoading ? <span className="nav-link nav-pending" aria-hidden="true">···</span> : user ? (
              <Link href="/profile" className={`nav-link nav-user ${isActive('/profile') ? 'active' : ''}`} data-testid="link-profile">{user.username}</Link>
            ) : (
              <Link href="/sign-in" className={`nav-link nav-user ${isActive('/sign-') ? 'active' : ''}`} data-testid="link-sign-in">{language === 'ru' ? 'Войти' : 'Sign in'}</Link>
            )}
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
  const sortedCountries = useMemo(() => getSortedCountries(language), [language]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState(queryCountry);
  const [examFilter, setExamFilter] = useState<ExamFilter>('');
  const [priceBand, setPriceBand] = useState('');
  const [dataAccuracy, setDataAccuracy] = useState<'' | 'verified' | 'approximate' | 'unlabeled'>('');
  const [sort, setSort] = useState<UniversitySort>('default');
  const [field, setField] = useState<Field | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [visibleLimit, setVisibleLimit] = useState(24);
  const hasPriceFilter = priceBand !== '';
  const detailedUniversityCount = useMemo(() => universities.filter((item) => {
    const detail = getUniversityInsight(item);
    return detail && !detail.approximate;
  }).length, []);

  useEffect(() => setCountry(queryCountry), [queryCountry]);
  useEffect(() => setVisibleLimit(24), [search, country, examFilter, priceBand, dataAccuracy, sort, field, level]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
    return sortUniversities(universities.filter((university) => {
      const facts = getUniversityFacts(university);
      const searchText = [
        university.name,
        university.country,
        university.region,
        ...Object.values(facts?.names ?? {}),
        ...(facts?.cities ?? []),
        ...university.domains,
      ].join(' ').toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
      const matchesSearch = !query || searchText.includes(query);
      const matchesCountry = !country || university.country === country;
      const insight = getUniversityInsight(university);
      const matchesTuition = !hasPriceFilter || insight?.priceBand === priceBand;
      const matchesExam = !examFilter || Boolean(insight?.exams.includes(examFilter));
      const matchesAccuracy =
        !dataAccuracy ||
        (dataAccuracy === 'unlabeled'
          ? !insight
          : Boolean(insight && (dataAccuracy === 'approximate' ? insight.approximate : !insight.approximate)));
      const matchesProgramme = matchesAcademic(university, field, level);
      return matchesSearch && matchesCountry && matchesTuition && matchesExam && matchesAccuracy && matchesProgramme;
    }), sort);
  }, [search, country, examFilter, priceBand, dataAccuracy, hasPriceFilter, language, sort, field, level]);

  const resetFilters = () => {
    setSearch('');
    setCountry('');
    setExamFilter('');
    setPriceBand('');
    setDataAccuracy('');
    setSort('default');
    setField('');
    setLevel('');
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
          <div className="search-input-wrap">
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
        </div>
        <div className="field">
          <label htmlFor="country-filter">{t.countryLabel}</label>
          <select id="country-filter" className="control" value={country} onChange={(event) => setCountry(event.target.value)} data-testid="select-country">
            <option value="">{t.allCountries}</option>
            {sortedCountries.map((item) => <option key={item.id} value={item.name}>{getCountryName(item, language)}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="exam-filter">{t.examFilterLabel}</label>
          <select id="exam-filter" className="control" value={examFilter} onChange={(event) => setExamFilter(event.target.value as ExamFilter)} data-testid="select-exam-level">
            <option value="">{t.anyExam}</option>
            {examOptions.map((option) => <option key={option.value} value={option.value}>{option.label[language]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="price-band">{language === 'ru' ? 'Ценовой диапазон за год' : 'Annual tuition range'}</label>
          <select id="price-band" className="control" value={priceBand} onChange={(event) => setPriceBand(event.target.value)} data-testid="select-price-band">
            <option value="">{t.anyPrice}</option>
            {priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label[language]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="data-accuracy">{t.dataAccuracyLabel}</label>
          <select id="data-accuracy" className="control" value={dataAccuracy} onChange={(event) => setDataAccuracy(event.target.value as typeof dataAccuracy)} data-testid="select-data-accuracy">
            <option value="">{t.allDataAccuracy}</option>
            <option value="verified">{t.verifiedOnly}</option>
            <option value="approximate">{t.approximateOnly}</option>
            <option value="unlabeled">{t.unlabeledOnly}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="field-filter">{language === 'ru' ? 'Направление' : 'Subject'}</label>
          <select id="field-filter" className="control" value={field} onChange={(event) => setField(event.target.value as Field | '')} data-testid="select-field">
            <option value="">{language === 'ru' ? 'Любое' : 'Any subject'}</option>
            {(Object.keys(fields) as Field[]).map((key) => <option key={key} value={key}>{fields[key][language]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="level-filter">{language === 'ru' ? 'Уровень' : 'Degree level'}</label>
          <select id="level-filter" className="control" value={level} onChange={(event) => setLevel(event.target.value as Level | '')} data-testid="select-level">
            <option value="">{language === 'ru' ? 'Любой' : 'Any level'}</option>
            {(Object.keys(levels) as Level[]).map((key) => <option key={key} value={key}>{levels[key][language]}</option>)}
          </select>
        </div>
        <button type="button" className="button secondary" onClick={resetFilters} data-testid="button-reset-filters">{t.reset}</button>
        <p className="filter-note">{t.priceSourceNote}</p>
        {(field || level) && <p className="filter-note programme-note" data-testid="text-programme-coverage">{language === 'ru'
          ? `Направление и уровень проверяются по одной и той же программе из небольшой выборки: ${programmeCoverage.programmes} программ у ${programmeCoverage.universities} вузов, найденных на их сайтах. Остальные вузы скрыты не потому, что программ нет, — мы просто не знаем.`
          : `Subject and level must match the same programme from a small sample: ${programmeCoverage.programmes} programmes at ${programmeCoverage.universities} universities, found on their websites. Other universities are hidden because we do not know, not because they lack programmes.`}</p>}
      </div>
      <div className="result-meta">
        <span data-testid="text-result-count">{formatNumber(filtered.length, language)} {t.countSuffix}</span>
        <span>{t.sourceLabel}</span>
        <div className="field catalog-sort">
          <label htmlFor="university-sort">{t.sortLabel}</label>
          <select id="university-sort" className="control" value={sort} onChange={(event) => setSort(event.target.value as UniversitySort)} data-testid="select-university-sort" aria-describedby={sort !== 'default' ? 'comparison-note' : undefined}>
            <option value="default">{t.sortDefault}</option>
            <option value="qs-rank">{t.sortQs}</option>
            <option value="review-rating">{t.sortReviews}</option>
          </select>
        </div>
      </div>
      {sort !== 'default' && <p id="comparison-note" className="coverage-note" data-testid="text-comparison-note">{sort === 'qs-rank' ? t.sortQsNote : t.sortReviewsNote}</p>}
      <p className="coverage-note" data-testid="text-detail-coverage">{t.detailCoverageLabel}: {formatNumber(detailedUniversityCount, language)}. {t.admissionDisclaimer}</p>
      <p className="coverage-note" data-testid="text-registry-coverage">{t.registryCoverageLabel}: {formatNumber(registryCoverage, language)} / {formatNumber(universities.length, language)}.</p>
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
          <h2>{hasPriceFilter ? t.priceUnavailable : t.emptyHeading}</h2>
          <p>{hasPriceFilter ? t.priceSourceNote : t.emptyText}</p>
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
  const insight = getUniversityInsight(university);
  const tuitionSummary = getTuitionSummary(university, language);
  const livingCost = getCountryLivingCost(university.countryCode, language);
  const reputation = getUniversityReputation(university);
  const facts = getUniversityFacts(university);

  return (
    <article className="uni-card" data-testid={`card-university-${university.id}`}>
      <div>
        <h2><Link href="/" aria-label={language === 'ru' ? `${university.name}: на главную` : `${university.name}: home`}>{university.name}</Link></h2>
        <div className="uni-loc">
          {facts?.cities.length ? `${facts.cities.join(', ')} · ` : ''}
          {university.region ? `${university.region}, ` : ''}{getCountryName(university, language)}
        </div>
        {facts?.established && <div className="uni-loc">{t.establishedLabel}: {facts.established}</div>}
        <div className="card-highlights">
            <div className="card-highlight-item"><strong>{t.tuitionTitle}</strong><span>{tuitionSummary ?? t.tuitionUnavailableShort}</span></div>
            <div className="card-highlight-item"><strong>{t.livingTitle}</strong><span>{livingCost ?? t.livingUnavailableShort}</span>{livingCost && <small>{t.livingExcludingHousingNote}</small>}</div>
        </div>
        {facts && <a className="data-badge" href={facts.source} target="_blank" rel="noreferrer">{t.registryBadge}</a>}
        {reputation && (
          <div className="card-reputation">
            {reputation.qs2027Rank !== undefined && reputation.qsSource && (
              <span>
                <strong>{t.qsRankingLabel}</strong> #{reputation.qs2027Rank} ·{' '}
                <a href={reputation.qsSource.url} target="_blank" rel="noreferrer">{reputation.qsSource.label}</a>
              </span>
            )}
            {reputation.studentReviewRating !== undefined && reputation.reviewSource && (
              <span>
                <strong>{t.studentReviewsLabel}</strong>: {reputation.studentReviewRating.toFixed(1)}/5
                {' '}<span className="rating-star" aria-hidden="true">★</span>
                {reputation.reviewCount !== undefined && ` · ${formatNumber(reputation.reviewCount, language)} ${t.reviewCountSuffix}`}
                {' · '}
                <a href={reputation.reviewSource.url} target="_blank" rel="noreferrer">{reputation.reviewSource.label}</a>
                {reputation.reviewCheckedAt && (
                  <small> · {t.reviewCheckedLabel} {formatDate(reputation.reviewCheckedAt, language)}</small>
                )}
                {isReviewRatingStale(reputation.reviewCheckedAt) && (
                  <span className="review-stale-warning">
                    <span aria-hidden="true">⚠ </span>{t.reviewStaleWarning}
                  </span>
                )}
              </span>
            )}
          </div>
        )}
        {insight && <span className={`data-badge ${insight.approximate ? 'approximate' : 'verified'}`}>{insight.approximate ? t.dataEstimate : t.dataVerified}</span>}
        <Link href={`/university/${university.id}`} className="detail-link" data-testid={`link-details-${university.id}`}>{t.viewDetails}</Link>
        <UniversityActions university={university} />
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
    return getSortedCountries(language).filter((country) => {
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
          {getCountryLivingCost(country.countryCode, language) && <p className="country-living"><strong>{t.livingTitle}:</strong> {getCountryLivingCost(country.countryCode, language)} <span>{t.livingExcludingHousingNote}</span></p>}
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
  const insight = getUniversityInsight(university);
  const facts = getUniversityFacts(university);

  return (
    <div className="page">
      <Link href="/" className="nav-link" data-testid="link-back"><ArrowLeft size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />{t.backCatalog}</Link>
      <header className="detail-head" style={{ marginTop: 20 }}>
        <div className="eyebrow">{getCountryName(university, language)}{insight?.city ? ` · ${insight.city[language]}` : university.region ? ` · ${university.region}` : ''}</div>
        <h1 className="page-title"><Link href="/" className="home-title-link">{university.name}</Link></h1>
        {insight && <span className={`data-badge ${insight.approximate ? 'approximate' : 'verified'}`}>{insight.approximate ? t.dataEstimate : t.dataVerified}</span>}
        {insight?.checkedAt && <p className="coverage-note">{t.checkedAtLabel}: <time dateTime={insight.checkedAt}>{new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', { timeZone: 'UTC' }).format(new Date(`${insight.checkedAt}T00:00:00Z`))}</time></p>}
        {insight?.approximate && <p className="disclaimer">{t.countryEstimateNote}</p>}
        <UniversityActions university={university} />
      </header>
      <div className="detail-columns">
        <div>
          <section className="detail-section"><h2>{t.tuitionTitle}</h2>{getTuitionSummary(university, language) && <div className="detail-tuition-summary" data-testid="text-tuition-summary">{getTuitionSummary(university, language)}</div>}<p>{insight?.tuition[language] ?? t.genericInfo}</p></section>
          {insight?.admission[language] && <section className="detail-section"><h2>{t.requirementsTitle}</h2><p>{insight.admission[language]}</p></section>}
          {insight?.application && <section className="detail-section" data-testid="section-application"><h2>{t.applicationTitle}</h2><p>{insight.application[language]}</p></section>}
          {insight?.funding[language] && <section className="detail-section"><h2>{t.benefitsTitle}</h2><p>{insight.funding[language]}</p></section>}
          <section className="detail-section"><h2>{t.livingTitle}</h2><p>{getCountryLivingCost(university.countryCode, language) ?? t.livingUnavailableShort}</p>{getCountryLivingCost(university.countryCode, language) && <p className="muted-note">{t.livingExcludingHousingNote}</p>}</section>
          <ProgrammeSection university={university} />
          {facts && <RegistryFacts facts={facts} language={language} />}
          {insight?.sources.length ? <section className="detail-section"><h2>{t.sourcesTitle}</h2><ul>{insight.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></section> : null}
          <div className="disclaimer">{t.admissionDisclaimer}</div>
        </div>
        <aside>
          <div className="info-box">
            <h2>{t.directoryDetails}</h2>
            <div className="info-row"><span>{t.countryLabel}</span><strong>{getCountryName(university, language)}</strong></div>
            {insight?.city && <div className="info-row"><span>{t.cityLabel}</span><strong>{insight.city[language]}</strong></div>}
            {!insight?.city && Boolean(facts?.cities.length) && <div className="info-row"><span>{t.cityLabel}</span><strong>{facts!.cities.join(', ')}</strong></div>}
            {university.region && <div className="info-row"><span>{t.regionLabel}</span><strong>{university.region}</strong></div>}
            <div className="info-row"><span>{t.officialWebsite}</span><strong>{website ? <a href={website} target="_blank" rel="noreferrer">{t.openWebsite}</a> : t.noWebsite}</strong></div>
          </div>
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
                      <Link href="/" className="recommendation-name">{university.name}</Link>
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
          <Route path="/compare" component={ComparePage} />
          <Route path="/admissions" component={AdmissionsPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/sign-in">{() => <AuthPage mode="sign-in" />}</Route>
          <Route path="/sign-up">{() => <AuthPage mode="sign-up" />}</Route>
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
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
