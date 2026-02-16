import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { runCommand } from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';

function verificationCommand(check) {
  if (check === 'lint') {
    return ['pnpm', ['lint'], 300_000];
  }
  if (check === 'test') {
    return ['pnpm', ['vitest', 'run'], 600_000];
  }
  if (check === 'typecheck') {
    return ['pnpm', ['exec', 'tsc', '-b'], 300_000];
  }
  if (check === 'storybook') {
    return ['pnpm', ['build-storybook'], 900_000];
  }
  fail(`Unsupported verification check: ${check}`);
}

export function stepVerify(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const verificationResults = [];

  for (const check of context.scenario.verification) {
    const [command, args, timeoutMs] = verificationCommand(check);
    const startedMs = Date.now();
    try {
      runCommand(command, args, {
        cwd: context.rootPath,
        timeoutMs,
      });
      verificationResults.push({
        check,
        status: 'passed',
        durationMs: Date.now() - startedMs,
      });
    } catch (error) {
      verificationResults.push({
        check,
        status: 'failed',
        durationMs: Date.now() - startedMs,
        error: error instanceof Error ? error.message : String(error),
      });
      context.verificationResults = verificationResults;
      throw error;
    }
  }

  if (context.scenario.verification.includes('storybook')) {
    const previewPath = resolve(context.rootPath, '.storybook/preview.tsx');
    if (!existsSync(previewPath)) {
      fail(
        'storybook verification requested, but `.storybook/preview.tsx` is missing.'
      );
    }
    const previewContent = readFileSync(previewPath, 'utf8');
    const requiredViewports = context.contracts.requiredViewports;
    const missingViewports = requiredViewports.filter(
      (viewport) => !previewContent.includes(viewport)
    );
    if (missingViewports.length > 0) {
      fail(
        `Missing required Storybook viewports: ${missingViewports.join(', ')}`
      );
    }

    if (
      context.scenario.gates.requireVisualApproval &&
      !context.options.approveVisual
    ) {
      fail(
        'Manual visual review is required after Storybook build. Re-run with --approve-visual after review.'
      );
    }
  }

  context.verificationResults = verificationResults;
  return {
    checks: verificationResults.length,
    passed: verificationResults.every((item) => item.status === 'passed'),
  };
}
