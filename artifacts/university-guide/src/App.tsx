import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
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
import { countries, questions, resultAreas, universities, type TestResult, type University } from './data';

const queryClient = new QueryClient();

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isActive = (path: string) => path === '/' ? location === '/' : location.startsWith(path);
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" data-testid="link-brand">путь<span className="brand-mark">.</span></Link>
        <nav className="nav-links" aria-label="Основная навигация">
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} data-testid="link-catalog">Вузы</Link>
          <Link href="/countries" className={`nav-link ${isActive('/countries') ? 'active' : ''}`} data-testid="link-countries">Страны</Link>
          <Link href="/tests" className={`nav-link ${isActive('/tests') ? 'active' : ''}`} data-testid="link-tests">Тест интересов</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">«Путь» — справочник для первого шага. Все примеры на сайте иллюстративны.</footer>
    </div>
  );
}

function CatalogPage() {
  const searchParams = useSearch();
  const queryCountry = new URLSearchParams(searchParams).get('country') || '';
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState(queryCountry);
  const [degree, setDegree] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
  useEffect(() => setCountry(queryCountry), [queryCountry]);
  const filtered = useMemo(() => universities.filter((university) => {
    const query = search.trim().toLocaleLowerCase('ru');
    const matchesSearch = !query || `${university.name} ${university.city} ${university.country} ${university.description}`.toLocaleLowerCase('ru').includes(query);
    return matchesSearch && (!country || university.country === country) &&
      (!degree || university.degreeLevels.includes(degree)) &&
      (!maxTuition || university.tuition <= Number(maxTuition));
  }), [search, country, degree, maxTuition]);
  const resetFilters = () => { setSearch(''); setCountry(''); setDegree(''); setMaxTuition(''); };

  return (
    <div className="page">
      <section className="catalog-hero">
        <div>
          <div className="eyebrow">Навигатор по высшему образованию</div>
          <h1 className="page-title">Найдите место,<br />где начнётся ваш путь.</h1>
          <p className="intro">Сравнивайте университеты и страны, изучайте базовые требования и собирайте список вариантов для дальнейшей проверки.</p>
        </div>
        <aside className="hero-note"><strong>С чего начать?</strong><br />Выберите страну, уровень и ориентир по стоимости. Затем проверьте детали поступления на официальном сайте вуза.</aside>
      </section>
      <div className="eyebrow">Каталог университетов</div>
      <div className="filter-panel" aria-label="Фильтры каталога">
        <div className="field search-wrap">
          <label htmlFor="university-search">Поиск</label>
          <Search size={16} aria-hidden="true" />
          <input id="university-search" className="control" type="search" placeholder="Вуз, город или направление" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-search" />
        </div>
        <div className="field">
          <label htmlFor="country-filter">Страна</label>
          <select id="country-filter" className="control" value={country} onChange={(event) => setCountry(event.target.value)} data-testid="select-country">
            <option value="">Все страны</option>
            {countries.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="degree-filter">Уровень</label>
          <select id="degree-filter" className="control" value={degree} onChange={(event) => setDegree(event.target.value)} data-testid="select-degree">
            <option value="">Любой уровень</option>
            <option>Бакалавриат</option><option>Магистратура</option><option>Докторантура</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tuition-filter">Стоимость в год, до</label>
          <select id="tuition-filter" className="control" value={maxTuition} onChange={(event) => setMaxTuition(event.target.value)} data-testid="select-tuition">
            <option value="">Любая сумма</option>
            <option value="5000">5 000 €</option><option value="10000">10 000 €</option><option value="16000">16 000 €</option>
          </select>
        </div>
        <button type="button" className="button secondary" onClick={resetFilters} data-testid="button-reset-filters">Сбросить</button>
      </div>
      <div className="result-meta"><span data-testid="text-result-count">{filtered.length} {filtered.length === 1 ? 'университет' : 'университета'}</span><span>Демо-данные · стоимость указана ориентировочно</span></div>
      {filtered.length ? (
        <div className="university-list" data-testid="list-universities">
          {filtered.map((university) => <UniversityCard key={university.id} university={university} />)}
        </div>
      ) : (
        <div className="empty-state" data-testid="empty-universities">
          <h2>Совпадений пока нет</h2><p>Попробуйте изменить условия поиска или сбросить фильтры.</p>
          <button className="button secondary" type="button" onClick={resetFilters} data-testid="button-empty-reset">Показать все вузы</button>
        </div>
      )}
      <div className="disclaimer">Важно: сроки, стоимость и требования могут меняться. Все данные в этом каталоге приведены для демонстрации и не являются официальной информацией.</div>
    </div>
  );
}

function UniversityCard({ university }: { university: University }) {
  return (
    <Link href={`/university/${university.id}`} className="uni-card" data-testid={`card-university-${university.id}`}>
      <div>
        <h2>{university.name}</h2>
        <div className="uni-loc">{university.city}, {university.country}</div>
        <p>{university.description}</p>
        <div className="tags">{university.degreeLevels.map((level) => <span className="tag" key={level}>{level}</span>)}</div>
      </div>
      <div className="uni-aside"><span>Ориентир в год</span><div className="price">{university.tuition.toLocaleString('ru-RU')} €</div><span>{university.studyLanguages.join(' · ')}</span><div style={{ marginTop: 16 }}><ArrowUpRight size={17} aria-hidden="true" /></div></div>
    </Link>
  );
}

function CountriesPage() {
  return (
    <div className="page">
      <div className="eyebrow">География обучения</div>
      <h1 className="page-title">Сначала выберите страну.</h1>
      <p className="intro">Короткие ориентиры помогут сравнить учебную среду. Нажмите на страну, чтобы увидеть университеты из каталога.</p>
      <div className="country-grid" data-testid="list-countries">
        {countries.map((country) => (
          <article className="country-card" key={country.id} data-testid={`card-country-${country.id}`}>
            <h2>{country.name}</h2>
            <p>{country.overview}</p>
            <div className="country-stats"><span>Языки: {country.language}</span><span>Жизнь: ~{country.estimatedLivingCost.toLocaleString('ru-RU')} €/мес.</span></div>
            <Link href={`/?country=${encodeURIComponent(country.name)}`} className="button secondary" data-testid={`link-country-catalog-${country.id}`}>Вузы страны <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} /></Link>
          </article>
        ))}
      </div>
      <div className="disclaimer">Расходы на жизнь — только приблизительная оценка для демонстрации. Реальный бюджет зависит от города и личных обстоятельств.</div>
    </div>
  );
}

function UniversityPage() {
  const [, params] = useRoute('/university/:id');
  const university = universities.find((item) => item.id === params?.id);
  if (!university) return <div className="page"><div className="empty-state"><h2>Университет не найден</h2><p>В демонстрационном каталоге нет такой записи.</p><Link href="/" className="button" data-testid="link-back-catalog">Вернуться в каталог</Link></div></div>;
  return (
    <div className="page">
      <Link href="/" className="nav-link" data-testid="link-back"><ArrowLeft size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />К каталогу</Link>
      <header className="detail-head" style={{ marginTop: 20 }}>
        <div className="eyebrow">{university.city}, {university.country}</div>
        <h1 className="page-title">{university.name}</h1>
        <p className="intro">{university.description}</p>
        <div className="tags">{university.degreeLevels.map((level) => <span key={level} className="tag">{level}</span>)}</div>
      </header>
      <div className="detail-columns">
        <div>
          <section className="detail-section"><h2>Требования для поступления</h2><ul>{university.admissionRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></section>
          <section className="detail-section"><h2>Возможные преимущества</h2><ul>{university.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></section>
          <section className="detail-section"><h2>Дополнительная информация</h2><p>{university.additionalInfo}</p></section>
        </div>
        <aside>
          <div className="info-box">
            <h2>Коротко о программе</h2>
            <div className="info-row"><span>Город / страна</span><strong>{university.city}, {university.country}</strong></div>
            <div className="info-row"><span>Уровни</span><strong>{university.degreeLevels.join(', ')}</strong></div>
            <div className="info-row"><span>Язык обучения</span><strong>{university.studyLanguages.join(', ')}</strong></div>
            <div className="info-row"><span>Ориентир за год</span><strong>{university.tuition.toLocaleString('ru-RU')} €</strong></div>
          </div>
          <div className="disclaimer">Данные и стоимость примерные, не являются официальными условиями приёма. Обязательно сверьтесь с сайтом университета.</div>
        </aside>
      </div>
    </div>
  );
}

function TestPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const currentQuestion = questions[step];
  const choose = (optionIndex: number) => setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }));
  const finishTest = () => {
    const scores: Record<string, number> = {};
    questions.forEach((question) => {
      const answerIndex = answers[question.id];
      if (answerIndex !== undefined) Object.entries(question.options[answerIndex].areaScores).forEach(([area, score]) => { scores[area] = (scores[area] || 0) + score; });
    });
    const winner = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'people';
    setResult(resultAreas[winner]);
  };
  const restart = () => { setStep(0); setAnswers({}); setResult(null); };

  return (
    <div className="page">
      <div className="eyebrow">Самопознание · 3 минуты</div>
      <h1 className="page-title">Что вам интересно?</h1>
      <p className="intro">Короткий тест поможет наметить направления для дальнейшего изучения. Это не профдиагностика и не готовый ответ о будущей профессии.</p>
      <section className="test-card" aria-live="polite">
        {!result ? (
          <>
            <div className="test-progress" aria-label={`Вопрос ${step + 1} из ${questions.length}`}>
              {questions.map((question, index) => <span key={question.id} className={`progress-segment ${index <= step ? 'filled' : ''}`} />)}
            </div>
            <div className="question-count" data-testid="text-question-step">ВОПРОС {step + 1} ИЗ {questions.length}</div>
            <h2 className="question-title">{currentQuestion.prompt}</h2>
            <div className="option-list">
              {currentQuestion.options.map((option, index) => (
                <button type="button" key={option.label} className={`option-button ${answers[currentQuestion.id] === index ? 'selected' : ''}`} onClick={() => choose(index)} aria-pressed={answers[currentQuestion.id] === index} data-testid={`button-answer-${currentQuestion.id}-${index}`}>
                  <span className="radio-dot" aria-hidden="true" />{option.label}
                </button>
              ))}
            </div>
            <div className="test-actions">
              <button type="button" className="button secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} data-testid="button-test-back">Назад</button>
              {step < questions.length - 1 ? (
                <button type="button" className="button" disabled={answers[currentQuestion.id] === undefined} onClick={() => setStep((value) => value + 1)} data-testid="button-test-next">Далее <ArrowRight size={15} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} /></button>
              ) : (
                <button type="button" className="button" disabled={answers[currentQuestion.id] === undefined} onClick={finishTest} data-testid="button-test-result">Показать результат</button>
              )}
            </div>
          </>
        ) : (
          <div className="result-panel" data-testid="panel-test-result">
            <div className="eyebrow">Ваш ориентир</div>
            <h2>{result.title}</h2>
            <p>{result.description}</p>
            <h3 className="field-label">Посмотрите на эти направления</h3>
            <div className="field-pills">{result.suggestedFields.map((field) => <span key={field}>{field}</span>)}</div>
            <p style={{ fontSize: 12, marginBottom: 0 }}>Результат отражает ваши ответы в этом коротком тесте и не заменяет консультацию или самостоятельное исследование программ.</p>
            <button type="button" className="button secondary" onClick={restart} data-testid="button-test-restart">Пройти ещё раз</button>
          </div>
        )}
      </section>
    </div>
  );
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
          <Route component={NotFound} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
