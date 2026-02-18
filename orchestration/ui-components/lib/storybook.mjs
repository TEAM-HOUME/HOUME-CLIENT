import { resolve } from 'node:path';

import { runCommand, runDetachedCommand } from './agent.mjs';
import { resolveCommandTimeoutMs } from './timeout-budget.mjs';

const STORYBOOK_DEFAULT_HOST = '127.0.0.1';
const STORYBOOK_DEFAULT_PORT = 6006;
const STORYBOOK_READY_POLL_MS = 500;
const STORYBOOK_READY_TIMEOUT_MS = 45_000;

function normalizeUrlCandidate(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value) {
    return '';
  }
  if (!/^http:\/\//i.test(value)) {
    return '';
  }
  return value;
}

function probeHttpUrl(url, cwd) {
  const result = runCommand(
    'curl',
    ['-sS', '--max-time', '2', '--output', '/dev/null', url],
    {
      cwd,
      timeoutMs: 5_000,
      allowFailure: true,
    }
  );
  return result.exitCode === 0;
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function resolveCandidateUrls() {
  const envUrl = normalizeUrlCandidate(process.env.UI_COMPONENTS_STORYBOOK_URL);
  const envPort = Number(process.env.UI_COMPONENTS_STORYBOOK_PORT);
  const defaultPort =
    Number.isInteger(envPort) && envPort > 0
      ? Math.trunc(envPort)
      : STORYBOOK_DEFAULT_PORT;
  const candidates = [
    envUrl,
    `http://127.0.0.1:${defaultPort}`,
    `http://localhost:${defaultPort}`,
  ]
    .filter(Boolean)
    .filter((candidate, index, list) => list.indexOf(candidate) === index);
  return candidates;
}

function resolvePreferredStorybookUrl(context) {
  const candidates = resolveCandidateUrls();
  for (const candidate of candidates) {
    if (probeHttpUrl(candidate, context.rootPath)) {
      return candidate;
    }
  }
  return null;
}

function resolveLaunchTargetUrl() {
  const envUrl = normalizeUrlCandidate(process.env.UI_COMPONENTS_STORYBOOK_URL);
  if (envUrl) {
    return envUrl;
  }

  const envHost = String(process.env.UI_COMPONENTS_STORYBOOK_HOST ?? '').trim();
  const envPort = Number(process.env.UI_COMPONENTS_STORYBOOK_PORT);
  const host = envHost || STORYBOOK_DEFAULT_HOST;
  const port =
    Number.isInteger(envPort) && envPort > 0
      ? Math.trunc(envPort)
      : STORYBOOK_DEFAULT_PORT;
  return `http://${host}:${port}`;
}

function ensureStorybookServer(context) {
  const launchTargetUrl = resolveLaunchTargetUrl();
  let parsedTarget;
  try {
    parsedTarget = new URL(launchTargetUrl);
  } catch {
    return {
      status: 'failed',
      reason: `유효하지 않은 Storybook URL 설정입니다: ${launchTargetUrl}`,
    };
  }
  if (parsedTarget.protocol !== 'http:') {
    return {
      status: 'failed',
      reason: `지원되지 않는 Storybook URL 프로토콜입니다: ${parsedTarget.protocol}`,
    };
  }
  const host = parsedTarget.hostname || STORYBOOK_DEFAULT_HOST;
  const resolvedPort = parsedTarget.port || String(STORYBOOK_DEFAULT_PORT);
  const storybookUrl = `http://${host}:${resolvedPort}`;
  const logPath = resolve(
    context.artifactsDir,
    `${context.runId}-storybook-dev.log`
  );

  const launch = runDetachedCommand(
    'pnpm',
    [
      'storybook',
      '--',
      '--host',
      host,
      '--port',
      resolvedPort,
      '--no-open',
      '--ci',
    ],
    {
      cwd: context.rootPath,
      stdoutPath: logPath,
      stderrPath: logPath,
    }
  );

  const deadline = Date.now() + STORYBOOK_READY_TIMEOUT_MS;
  while (Date.now() <= deadline) {
    if (probeHttpUrl(storybookUrl, context.rootPath)) {
      return {
        status: 'started',
        url: storybookUrl,
        pid: launch.pid,
        logPath,
      };
    }
    sleepSync(STORYBOOK_READY_POLL_MS);
  }

  return {
    status: 'failed',
    url: storybookUrl,
    reason: `Storybook 서버가 ${STORYBOOK_READY_TIMEOUT_MS}ms 내에 준비되지 않았습니다. 로그: ${logPath}`,
  };
}

export function maybeOpenStorybook(context) {
  if (!context.options.openStorybook) {
    return {
      status: 'skipped',
      reason: '--open-storybook 미사용',
    };
  }
  if (context.options.dryRun) {
    return {
      status: 'skipped',
      reason: '--dry-run에서는 Storybook 자동 열기를 건너뜀',
    };
  }

  if (!context.scenario.verification.includes('storybook')) {
    return {
      status: 'skipped',
      reason: '`verification`에 storybook이 없음',
    };
  }

  let storybookUrl = resolvePreferredStorybookUrl(context);
  let source = 'http-existing';
  if (!storybookUrl) {
    if (process.platform === 'win32') {
      return {
        status: 'failed',
        reason:
          '윈도우 자동 Storybook 서버 기동은 아직 지원하지 않습니다. 수동으로 `pnpm storybook -- --host 127.0.0.1 --port 6006 --no-open` 실행 후 다시 시도하세요.',
      };
    }
    const serverResult = ensureStorybookServer(context);
    if (serverResult.status !== 'started') {
      context.warnings.push(serverResult.reason);
      return {
        status: 'failed',
        url: serverResult.url,
        reason: serverResult.reason,
      };
    }
    storybookUrl = serverResult.url;
    source = 'http-started';
  }

  const openCommand =
    process.platform === 'darwin'
      ? ['open', [storybookUrl]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', storybookUrl]]
        : ['xdg-open', [storybookUrl]];

  const [command, args] = openCommand;
  const result = runCommand(command, args, {
    cwd: context.rootPath,
    timeoutMs: resolveCommandTimeoutMs(context, 'storybook:open', 10_000),
    allowFailure: true,
  });

  if (result.exitCode !== 0) {
    const reason = result.stderr || result.stdout || 'open command failed';
    context.warnings.push(`자동 Storybook 열기 실패: ${reason}`);
    return {
      status: 'failed',
      url: storybookUrl,
      reason,
    };
  }

  return {
    status: 'opened',
    url: storybookUrl,
    source,
  };
}
