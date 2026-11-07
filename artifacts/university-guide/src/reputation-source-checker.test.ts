import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  checkSources, collectSources, defaults, formatResult, summarize, validateOptions,
} from '../scripts/reputation-source-checker';
import { universityReputationByName } from './university-insights';

const source = (url = 'https://example.com/reviews') => ({ url, references: ['Test University · Отзывы · Reviews'] });

test('collects both source fields, deduplicates URLs and never changes reputation data', async () => {
  const before = JSON.stringify(universityReputationByName);
  const sources = collectSources(universityReputationByName);
  assert.ok(sources.length > 0);
  assert.equal(sources.length, new Set(sources.map((s) => s.url)).size);
  const first = sources[0];
  assert.ok(first.references.some((r) => r.includes('QS')));
  assert.ok(first.references.some((r) => r.includes('Отзывы')));
  await checkSources(sources, defaults, {
    fetch: async () => new Response(null, { status: 404 }),
    sleep: async () => {},
  });
  assert.equal(JSON.stringify(universityReputationByName), before);
});

test('follows relative redirects manually and reports every hop and reference', async () => {
  const calls: string[] = [];
  const pauses: number[] = [];
  let cancelled = 0;
  const results = await checkSources([source(), source('https://example.com/second')], defaults, {
    fetch: async (url, init) => {
      calls.push(String(url));
      assert.equal(init?.redirect, 'manual');
      assert.equal(init?.method, 'GET');
      assert.ok(init.signal instanceof AbortSignal);
      return new Response(new ReadableStream({ cancel() { cancelled++; } }), {
        status: calls.length === 1 ? 301 : 200,
        headers: calls.length === 1 ? { location: '/new' } : {},
      });
    },
    sleep: async (ms) => { pauses.push(ms); },
  });
  assert.deepEqual(calls, ['https://example.com/reviews', 'https://example.com/new', 'https://example.com/second']);
  assert.deepEqual(pauses, [750, 750]);
  assert.equal(cancelled, 3);
  assert.deepEqual(results.map((r) => r.outcome), ['redirect', 'ok']);
  assert.match(formatResult(results[0]), /HTTP 301.*→ https:\/\/example.com\/new/);
  assert.match(formatResult(results[0]), /Test University/);
  assert.match(summarize(results), /перенаправления: 1; ошибки: 0/);
});

test('reports HTTP errors and network failures but continues checking remaining links', async () => {
  const statuses = [404, 500, 403, 429];
  const results = await checkSources(Array.from({ length: 7 }, (_, i) => source(`https://example.com/${i}`)), defaults, {
    fetch: async (url) => {
      const i = Number(String(url).split('/').pop());
      if (i === 4) throw new TypeError('fetch failed', { cause: new Error('DNS lookup failed') });
      if (i === 5) throw new DOMException('request timed out', 'TimeoutError');
      return new Response(null, { status: statuses[i] ?? 200 });
    },
    sleep: async () => {},
  });
  assert.deepEqual(results.map((r) => r.outcome), [...Array(6).fill('error'), 'ok']);
  assert.match(formatResult(results[2]), /защита от ботов/);
  assert.match(formatResult(results[3]), /повторите позже/);
  assert.match(formatResult(results[4]), /DNS lookup failed/);
  assert.match(formatResult(results[5]), /TimeoutError/);
});

test('rejects unsafe URLs without requesting them', async () => {
  for (const url of ['bad url', 'ftp://example.com', 'https://user:password@example.com']) {
    const [result] = await checkSources([source(url)], defaults, {
      fetch: async () => { throw new Error('must not request'); },
      sleep: async () => {},
    });
    assert.equal(result.outcome, 'error');
    assert.doesNotMatch(result.error!, /must not request/);
  }
});

test('bounds redirects, detects loops, missing locations and unsafe targets', async () => {
  for (const scenario of ['loop', 'limit', 'missing', 'unsafe'] as const) {
    let calls = 0;
    const [result] = await checkSources([source()], { ...defaults, maxRedirects: 2 }, {
      fetch: async () => {
        calls++;
        return new Response(null, { status: 302, headers: scenario === 'missing' ? {} : {
          location: scenario === 'loop' ? '/reviews'
            : scenario === 'unsafe' ? 'file:///etc/passwd' : `/redirect-${calls}`,
        } });
      },
      sleep: async () => {},
    });
    assert.equal(result.outcome, 'error');
    assert.ok(calls <= 3);
    assert.match(result.error!, { loop: /Цикл/, limit: /лимит/, missing: /Location/, unsafe: /HTTP\(S\)/ }[scenario]);
  }
});

test('timeout signal actually aborts a stalled request', async () => {
  const [result] = await checkSources([source()], { ...defaults, timeoutMs: 100 }, {
    fetch: async (_url, init) => new Promise<Response>((_resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout did not abort')), 1000);
      init!.signal!.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(init!.signal!.reason);
      }, { once: true });
    }),
    sleep: async () => {},
  });
  assert.match(result.error!, /TimeoutError/);
});

test('rejects unbounded, fractional and invalid limits before making requests', () => {
  for (const options of [
    { ...defaults, intervalMs: 0 }, { ...defaults, timeoutMs: NaN },
    { ...defaults, maxRedirects: 11 }, { ...defaults, maxRedirects: 1.5 },
    { ...defaults, timeoutMs: Infinity },
  ]) assert.throws(() => validateOptions(options));
});
