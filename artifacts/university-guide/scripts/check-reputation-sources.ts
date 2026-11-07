import { parseArgs } from 'node:util';
import { universityReputationByName } from '../src/university-insights';
import { checkSources, collectSources, defaults, formatResult, summarize, validateOptions } from './reputation-source-checker';

async function main() {
  const { values } = parseArgs({
    options: {
      'interval-ms': { type: 'string' },
      'timeout-ms': { type: 'string' },
      'max-redirects': { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log('pnpm --filter @workspace/university-guide check:sources [--interval-ms 750] [--timeout-ms 10000] [--max-redirects 5]');
    console.log('Последовательно проверяет источники QS и отзывов. Только чтение; код 1 при ошибках, 2 при неверных параметрах.');
    return;
  }
  const options = {
    intervalMs: values['interval-ms'] === undefined ? defaults.intervalMs : Number(values['interval-ms']),
    timeoutMs: values['timeout-ms'] === undefined ? defaults.timeoutMs : Number(values['timeout-ms']),
    maxRedirects: values['max-redirects'] === undefined ? defaults.maxRedirects : Number(values['max-redirects']),
  };
  validateOptions(options);
  const sources = collectSources(universityReputationByName);
  console.log(`Проверка ${sources.length} уникальных ссылок: 1 запрос одновременно, пауза ${options.intervalMs} мс, тайм-аут ${options.timeoutMs} мс, до ${options.maxRedirects} перенаправлений.`);
  console.log('Проверяется доступность HTTP, а не достоверность оценок. Данные не изменяются.');
  const results = await checkSources(sources, options, undefined, (result) => console.log(formatResult(result)));
  console.log(summarize(results));
  console.log('Ошибки сети/403/429 не доказывают удаление страницы. Проверьте проблемные ссылки вручную; успешные перенаправления также требуют проверки соответствия вузу.');
  process.exitCode = results.some((result) => result.outcome === 'error') ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
