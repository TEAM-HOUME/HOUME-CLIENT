import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** @type {Map<string, string>} */
const options = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (
    !key ||
    !['--spec', '--grep', '--mode'].includes(key) ||
    !value ||
    options.has(key)
  )
    throw new Error('허용 인자: --spec, --grep, --mode');
  options.set(key, value);
}
const spec = options.get('--spec');
if (spec && !['e2e/harness.spec.ts', 'e2e/imageFlow.spec.ts'].includes(spec))
  throw new Error('U1 spec 파일만 실행할 수 있습니다.');
const mode = options.get('--mode') ?? 'normal';
if (!['normal', 'repeat', 'missing-mock'].includes(mode))
  throw new Error('알 수 없는 실행 mode');
if (!process.version.startsWith('v22.'))
  throw new Error('Node 22.x로 실행하세요. 현재: ' + process.version);
const root = resolve('test-results/image-flow');
const runDir = resolve(
  root,
  new Date().toISOString().replace(/[:.]/g, '-') + '-' + mode
);
await mkdir(runDir, { recursive: true });
await mkdir(resolve(root, 'empty-env'), { recursive: true });
/** @type {NodeJS.ProcessEnv} */
const env = {};
for (const key of [
  'PATH',
  'HOME',
  'USER',
  'TMPDIR',
  'LANG',
  'PLAYWRIGHT_BROWSERS_PATH',
]) {
  if (process.env[key]) env[key] = process.env[key];
}
Object.assign(env, {
  NODE_ENV: 'production',
  VITE_API_BASE_URL: 'http://127.0.0.1:4173',
  VITE_ENABLE_FIREBASE_ANALYTICS: 'false',
  VITE_ENABLE_META_PIXEL: 'false',
  VITE_FIREBASE_PROJECT_ID: '',
  VITE_CLARITY_PROJECT_ID: '',
  VITE_META_PIXEL_ID: '',
  VITE_SENTRY_DSN: 'http://e2e@127.0.0.1:4173/1',
  VITE_SENTRY_ENVIRONMENT: 'e2e-local',
  VITE_ANALYTICS_ENV: 'local',
  VITE_SENTRY_FORCE_ENABLE: 'false',
});
/** @type {import('node:child_process').ChildProcess | undefined} */
let active;
/** @param {string[]} args @param {string} name @param {NodeJS.ProcessEnv} [extra] */
async function execute(args, name, extra = {}) {
  const start = performance.now();
  let output = '';
  /** @type {Promise<number>} */
  const completion = new Promise((resolveCode, reject) => {
    active = spawn(process.execPath, args, {
      env: { ...env, ...extra },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    active.stdout?.on('data', (chunk) => {
      const text = String(chunk);
      output += text;
      process.stdout.write(text);
    });
    active.stderr?.on('data', (chunk) => {
      const text = String(chunk);
      output += text;
      process.stderr.write(text);
    });
    active.once('error', reject);
    active.once('close', (value, signal) =>
      resolveCode(value ?? (signal ? 1 : 0))
    );
  });
  const code = await completion;
  await writeFile(resolve(runDir, name + '.log'), output);
  return { name, code, durationMs: performance.now() - start };
}
process.once('SIGINT', () => {
  active?.kill('SIGINT');
  process.exitCode = 130;
});
process.once('SIGTERM', () => {
  active?.kill('SIGTERM');
  process.exitCode = 143;
});
const measurements = [];

/** @typedef {{status: string, errors?: {message?: string}[], attachments?: {name: string, body?: string}[]}} TestResult */
/** @typedef {{suites?: ReportSuite[], specs?: {tests: {results: TestResult[]}[]}[]}} ReportSuite */
/** @param {ReportSuite} suite @returns {TestResult[]} */
function reportResults(suite) {
  return [
    ...(suite.specs ?? []).flatMap((spec) =>
      spec.tests.flatMap((test) => test.results)
    ),
    ...(suite.suites ?? []).flatMap(reportResults),
  ];
}
/** @param {string} folder */
async function verifyMissingMock(folder) {
  const report = /** @type {ReportSuite} */ (
    parseJson(await readFile(resolve(folder, 'results.json'), 'utf8'))
  );
  const results = reportResults(report);
  const target = 'MissingMockError POST /api/v4/generated-images/generate';
  if (
    results.length !== 1 ||
    results[0]?.status !== 'failed' ||
    !results[0].errors?.length ||
    !results[0].errors.every((error) => error.message?.includes(target))
  ) {
    throw new Error('실패 원인이 지정된 생성 mock 누락과 다릅니다.');
  }
  const encoded = results[0].attachments?.find(
    (item) => item.name === 'request-journal'
  )?.body;
  if (!encoded) throw new Error('blocked journal이 없습니다.');
  const evidence =
    /** @type {{journal: {method: string, path: string, origin: string, disposition: string}[]}} */ (
      parseJson(Buffer.from(encoded, 'base64').toString('utf8'))
    );
  const generated = evidence.journal.filter(
    (item) =>
      item.method === 'POST' &&
      item.path === '/api/v4/generated-images/generate'
  );
  if (
    generated.length !== 1 ||
    generated[0]?.disposition !== 'blocked' ||
    generated[0].origin !== 'http://127.0.0.1:4173'
  )
    throw new Error('생성 POST의 전송 전 차단 근거가 없습니다.');
}
/** @param {string} value @returns {unknown} */
function parseJson(value) {
  return JSON.parse(value);
}
try {
  const build = await execute(
    [
      'node_modules/vite/bin/vite.js',
      'build',
      '--config',
      'e2e/vite.config.ts',
    ],
    'build'
  );
  measurements.push(build);
  if (build.code !== 0) throw new Error('테스트용 build 실패');
  const args = [
    'node_modules/@playwright/test/cli.js',
    'test',
    '--config',
    'e2e/playwright.config.ts',
  ];
  if (spec) args.push(spec);
  // Playwright는 파일명까지 합친 full title에 grep을 적용한다. CLI의 ^는 시나리오 이름 시작을 뜻한다.
  const grep = options.get('--grep');
  if (grep) args.push('--grep', grep.replace(/^\^/, '(?:^|\\s)'));
  if (mode === 'missing-mock') {
    const diagnosisArgs = [
      'node_modules/@playwright/test/cli.js',
      'test',
      '--config',
      'e2e/playwright.config.ts',
      'e2e/imageFlow.spec.ts',
      '--grep',
      '(?:^|\\s)정상 풀퍼널의 선택값과 성공 이미지',
    ];
    const missingDir = resolve(runDir, 'missing');
    const missing = await execute(diagnosisArgs, 'missing', {
      E2E_RUN_DIR: missingDir,
      E2E_MISSING_GENERATE: '1',
    });
    measurements.push(missing);
    if (missing.code === 0)
      throw new Error('mock 누락 child가 잘못 통과했습니다.');
    await verifyMissingMock(missingDir);
    const recovery = await execute(diagnosisArgs, 'recovery', {
      E2E_RUN_DIR: resolve(runDir, 'recovery'),
    });
    measurements.push(recovery);
    if (recovery.code !== 0)
      throw new Error('mock 복원 후 정상 풀퍼널 테스트가 실패했습니다.');
    console.log(
      'mock 누락 진단: 지정 MissingMockError + blocked journal + 비정상 종료 확인, 정상 풀퍼널 복구 통과'
    );
  } else
    for (let i = 1; i <= (mode === 'repeat' ? 3 : 1); i++) {
      const result = await execute(args, 'run-' + i, {
        E2E_RUN_DIR: resolve(runDir, 'run-' + i),
      });
      measurements.push(result);
      if (result.code !== 0) throw new Error('테스트 실패: run-' + i);
    }
} finally {
  active?.kill('SIGTERM');
  await writeFile(
    resolve(runDir, 'summary.json'),
    JSON.stringify(
      {
        node: process.version,
        mode,
        measurements,
        humanInteractionDuringRunMs: 0,
      },
      null,
      2
    )
  );
  console.log('실행 기록: ' + runDir);
}
