import type { UniversityReputation } from '../src/university-insights';

export type Source = { url: string; references: string[] };
export type SourceResult = Source & {
  outcome: 'ok' | 'redirect' | 'error';
  hops: { url: string; status: number; target?: string }[];
  error?: string;
};

export const defaults = { intervalMs: 750, timeoutMs: 10_000, maxRedirects: 5 };
type Options = typeof defaults;
type Dependencies = {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
};

/** Read both citation fields, including shared URLs, without touching the data. */
export function collectSources(mapping: Readonly<Record<string, UniversityReputation>>): Source[] {
  const sources = new Map<string, Source>();
  for (const [name, reputation] of Object.entries(mapping)) {
    for (const field of ['qsSource', 'reviewSource'] as const) {
      const source = reputation[field];
      if (!source) continue;
      const entry = sources.get(source.url) ?? { url: source.url, references: [] };
      entry.references.push(`${name} · ${field === 'qsSource' ? 'QS' : 'Отзывы'} · ${source.label}`);
      sources.set(source.url, entry);
    }
  }
  return [...sources.values()];
}

function httpUrl(value: string): string {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Ожидалась ссылка HTTP(S) без учётных данных');
  }
  url.hash = '';
  return url.href;
}

export function validateOptions(options: Options) {
  for (const [key, min, max] of [
    ['intervalMs', 100, 60_000],
    ['timeoutMs', 100, 60_000],
    ['maxRedirects', 0, 10],
  ] as const) {
    if (!Number.isSafeInteger(options[key]) || options[key] < min || options[key] > max) {
      throw new Error(`${key}: требуется целое число от ${min} до ${max}`);
    }
  }
}

/**
 * One request at a time, with a pause between ALL requests (including redirects).
 * No retries: 429/403 must be reported rather than increasing pressure on a site.
 */
export async function checkSources(
  sources: Source[],
  options: Options = defaults,
  dependencies: Dependencies = {
    fetch: globalThis.fetch,
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  },
  onResult: (result: SourceResult) => void = () => {},
): Promise<SourceResult[]> {
  validateOptions(options);
  let requests = 0;
  const results: SourceResult[] = [];
  for (const source of sources) {
    const result: SourceResult = { ...source, outcome: 'error', hops: [] };
    try {
      let current = httpUrl(source.url);
      const visited = new Set<string>();
      while (true) {
        if (visited.has(current)) throw new Error('Цикл перенаправлений');
        visited.add(current);
        if (requests++ > 0) await dependencies.sleep(options.intervalMs);
        const response = await dependencies.fetch(current, {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(options.timeoutMs),
          headers: { 'User-Agent': 'UniversityGuide-SourceChecker/1.0', Accept: 'text/html' },
        });
        // Only availability is checked; do not download or parse the page.
        if (response.body) await response.body.cancel();
        const hop: SourceResult['hops'][number] = { url: current, status: response.status };
        result.hops.push(hop);
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get('location');
          if (!location) throw new Error(`HTTP ${response.status}: отсутствует Location`);
          hop.target = httpUrl(new URL(location, current).href);
          if (result.hops.length > options.maxRedirects) {
            throw new Error(`Превышен лимит перенаправлений (${options.maxRedirects})`);
          }
          current = hop.target;
          continue;
        }
        if (!response.ok) {
          const explanation = response.status === 403
            ? ' (доступ запрещён; возможна защита от ботов)'
            : response.status === 429 ? ' (слишком много запросов; повторите позже)' : '';
          throw new Error(`HTTP ${response.status}${explanation}`);
        }
        result.outcome = result.hops.length > 1 ? 'redirect' : 'ok';
        break;
      }
    } catch (error) {
      result.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      if (error instanceof Error && error.cause instanceof Error) {
        result.error += ` (${error.cause.message})`;
      }
    }
    results.push(result);
    onResult(result);
  }
  return results;
}

export function formatResult(result: SourceResult): string {
  const label = { ok: 'OK', redirect: 'ПЕРЕНАПРАВЛЕНИЕ', error: 'ОШИБКА' }[result.outcome];
  return [
    `[${label}] ${result.url}`,
    ...result.references.map((reference) => `  Источник: ${reference}`),
    ...result.hops.map((hop) => `  HTTP ${hop.status} ${hop.url}${hop.target ? ` → ${hop.target}` : ''}`),
    ...(result.error ? [`  ${result.error}`] : []),
  ].join('\n');
}

export function summarize(results: SourceResult[]) {
  const count = (outcome: SourceResult['outcome']) => results.filter((r) => r.outcome === outcome).length;
  return `Итого: ${results.length} ссылок; доступны без перенаправлений: ${count('ok')}; перенаправления: ${count('redirect')}; ошибки: ${count('error')}.`;
}
