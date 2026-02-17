import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runCommand } from './agent.mjs';

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

  let storybookIndexPath = resolve(
    context.rootPath,
    'storybook-static/index.html'
  );
  if (!existsSync(storybookIndexPath)) {
    const buildResult = runCommand('pnpm', ['build-storybook'], {
      cwd: context.rootPath,
      timeoutMs: 900_000,
      allowFailure: true,
    });
    if (buildResult.exitCode !== 0) {
      const reason =
        buildResult.stderr || buildResult.stdout || 'build-storybook failed';
      context.warnings.push(`Storybook 빌드 실패: ${reason}`);
      return {
        status: 'failed',
        reason: `Storybook build failed: ${reason}`,
      };
    }
    storybookIndexPath = resolve(
      context.rootPath,
      'storybook-static/index.html'
    );
  }

  if (!existsSync(storybookIndexPath)) {
    return {
      status: 'failed',
      reason: '`storybook-static/index.html` 생성 실패',
    };
  }

  const storybookUrl = pathToFileURL(storybookIndexPath).toString();
  const openCommand =
    process.platform === 'darwin'
      ? ['open', [storybookUrl]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', storybookUrl]]
        : ['xdg-open', [storybookUrl]];

  const [command, args] = openCommand;
  const result = runCommand(command, args, {
    cwd: context.rootPath,
    timeoutMs: 10_000,
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
  };
}
