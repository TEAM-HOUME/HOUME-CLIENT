import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runDirect() {
  const scriptPath = resolve(
    process.cwd(),
    'orchestration/ui-components/run.mjs'
  );
  const result = spawnSync(
    process.execPath,
    [scriptPath, ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );
  process.exit(result.status ?? 1);
}

function runViaScriptPty() {
  const scriptPath = resolve(
    process.cwd(),
    'orchestration/ui-components/run.mjs'
  );
  const args = [...process.argv.slice(2)];
  const env = {
    ...process.env,
    UI_COMPONENTS_PTY_WRAPPED: '1',
  };

  if (process.platform === 'darwin') {
    const result = spawnSync(
      'script',
      ['-q', '/dev/null', process.execPath, scriptPath, ...args],
      {
        stdio: 'inherit',
        env,
      }
    );
    process.exit(result.status ?? 1);
  }

  if (process.platform === 'linux') {
    const commandLine = [process.execPath, scriptPath, ...args]
      .map(shellEscape)
      .join(' ');
    const result = spawnSync('script', ['-q', '-c', commandLine, '/dev/null'], {
      stdio: 'inherit',
      env,
    });
    process.exit(result.status ?? 1);
  }

  runDirect();
}

function main() {
  if (
    process.env.UI_COMPONENTS_PTY_WRAPPED === '1' ||
    !process.stdin.isTTY ||
    !process.stdout.isTTY
  ) {
    runDirect();
    return;
  }

  const probe = spawnSync('script', ['--version'], {
    stdio: 'ignore',
    env: process.env,
  });
  if (probe.error || probe.status !== 0) {
    runDirect();
    return;
  }

  runViaScriptPty();
}

main();
