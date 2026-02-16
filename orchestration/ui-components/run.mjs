import { existsSync, mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runCommand } from './lib/agent.mjs';
import { getChangedFiles } from './lib/git-gates.mjs';
import { createRunId, writeReport } from './lib/report.mjs';
import { parseArgs, readScenario } from './lib/scenario.mjs';
import { stepExtractFigmaScope } from './steps/extract-figma-scope.mjs';
import { stepExtractCodeConnectMap } from './steps/extract-code-connect-map.mjs';
import { stepGateCodeConnect } from './steps/gate-code-connect.mjs';
import { stepGateChangedPaths } from './steps/gate-changed-paths.mjs';
import { stepGateStoryDesignLinks } from './steps/gate-story-design-links.mjs';
import { stepPreflight } from './steps/preflight.mjs';
import { stepResolveComponent } from './steps/resolve-component-plan.mjs';
import { stepRunAgent } from './steps/run-agent-implementation.mjs';
import { stepVerify } from './steps/verify.mjs';

function formatDuration(durationMs) {
  if (durationMs < 1_000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1_000).toFixed(1)}s`;
}

function summarizeStepOutput(name, output) {
  if (!output || typeof output !== 'object') {
    return '';
  }
  if (output.skipped) {
    return `건너뜀: ${output.reason}`;
  }

  if (name === 'preflight') {
    return `엔진=${output.engine}, 실행=${output.command}(${output.mode})`;
  }
  if (name === 'extract-figma-scope') {
    return `스코프=${output.selectedNodeId}, 소스=${output.source}`;
  }
  if (name === 'resolve-component-plan') {
    return `계획=${output.action}, 대상=${output.targetPath}`;
  }
  if (name === 'run-agent-implementation') {
    const changedCount = Array.isArray(output.changedFiles)
      ? output.changedFiles.length
      : 0;
    return `변경 파일=${changedCount}개`;
  }
  if (name === 'gate-changed-paths') {
    return `검사 파일=${output.checkedFiles}개`;
  }
  if (name === 'gate-story-design-links') {
    return `스토리 디자인 링크 검사=${output.checkedStories}개`;
  }
  if (name === 'extract-code-connect-map') {
    return `상태=${output.status}, 매핑=${output.mappings}개`;
  }
  if (name === 'gate-code-connect') {
    return `모드=${output.mode}, 불일치=${output.mismatches?.length ?? 0}개`;
  }
  if (name === 'verify') {
    return `검증=${output.checks}개, 통과=${output.passed ? '예' : '아니오'}`;
  }
  return '';
}

function runStep(context, name, handler) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const stepLog = {
    name,
    status: 'running',
    startedAt,
  };
  context.steps.push(stepLog);
  console.log(`[ui-components] [${name}] 시작`);

  try {
    const output = handler(context);
    stepLog.status = 'passed';
    if (output !== undefined) {
      stepLog.output = output;
    }
  } catch (error) {
    stepLog.status = 'failed';
    stepLog.error = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    stepLog.finishedAt = new Date().toISOString();
    stepLog.durationMs = Date.now() - startedMs;
    const durationText = formatDuration(stepLog.durationMs);
    if (stepLog.status === 'passed') {
      const summary = summarizeStepOutput(name, stepLog.output);
      console.log(
        `[ui-components] [${name}] 통과 (${durationText})${summary ? ` - ${summary}` : ''}`
      );
      return;
    }
    console.log(
      `[ui-components] [${name}] 실패 (${durationText}) - ${stepLog.error}`
    );
  }
}

function maybeOpenStorybook(context) {
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

  const storybookIndexPath = resolve(
    context.rootPath,
    'storybook-static/index.html'
  );
  if (!existsSync(storybookIndexPath)) {
    return {
      status: 'skipped',
      reason: '`storybook-static/index.html`이 없음',
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

function main() {
  const args = parseArgs(process.argv);
  if (!args.scenarioArg) {
    console.error(
      '[ui-components] 사용법: pnpm ui:run --scenario orchestration/ui-components/scenarios/<name>.yml [--dry-run] [--approve-visual] [--skip-mcp-check] [--open-storybook]'
    );
    process.exit(1);
  }

  const scenario = readScenario(args.scenarioArg);
  const rootPath = process.cwd();
  const runId = createRunId(scenario.id);

  const artifactsDir = resolve(
    rootPath,
    'orchestration/ui-components/artifacts'
  );
  const reportsDir = resolve(rootPath, 'orchestration/ui-components/reports');
  mkdirSync(artifactsDir, { recursive: true });
  mkdirSync(reportsDir, { recursive: true });

  const context = {
    runId,
    rootPath,
    artifactsDir,
    options: args,
    scenario,
    steps: [],
    warnings: [],
    status: 'failed',
    error: null,
    agentRuntime: null,
    contracts: null,
    figmaScope: null,
    designContextArtifactPath: null,
    codeConnectArtifactPath: null,
    codeConnectMap: null,
    codeConnectGate: null,
    componentPlan: null,
    implementationResult: null,
    storybookOpenResult: null,
    agentTraceArtifacts: [],
    initialChangedFiles: getChangedFiles(rootPath),
    newChangedFiles: [],
    verificationResults: [],
  };

  let exitCode = 0;

  try {
    runStep(context, 'preflight', stepPreflight);
    runStep(context, 'extract-figma-scope', stepExtractFigmaScope);
    runStep(context, 'resolve-component-plan', stepResolveComponent);
    runStep(context, 'run-agent-implementation', stepRunAgent);
    runStep(context, 'gate-changed-paths', stepGateChangedPaths);
    runStep(context, 'gate-story-design-links', stepGateStoryDesignLinks);
    runStep(context, 'extract-code-connect-map', stepExtractCodeConnectMap);
    runStep(context, 'gate-code-connect', stepGateCodeConnect);
    runStep(context, 'verify', stepVerify);
    context.status = 'passed';
    context.storybookOpenResult = maybeOpenStorybook(context);
  } catch (error) {
    context.status = 'failed';
    context.error = error instanceof Error ? error.message : String(error);
    exitCode = 1;
  }

  const reportPath = writeReport(context);
  const passedSteps = context.steps.filter(
    (step) => step.status === 'passed'
  ).length;
  const totalSteps = context.steps.length;

  console.log(`[ui-components] 단계 요약: ${passedSteps}/${totalSteps} 통과`);
  if (context.storybookOpenResult?.status === 'opened') {
    console.log(
      `[ui-components] Storybook 열기 완료: ${context.storybookOpenResult.url}`
    );
  } else if (
    context.storybookOpenResult &&
    context.storybookOpenResult.status !== 'skipped'
  ) {
    console.log(
      `[ui-components] Storybook 열기 실패: ${context.storybookOpenResult.reason}`
    );
  }
  if (context.warnings.length > 0) {
    console.log(`[ui-components] 경고: ${context.warnings.length}건`);
  }
  console.log(
    `[ui-components] 리포트: ${relative(context.rootPath, reportPath)}`
  );

  if (context.status === 'failed') {
    console.error(`[ui-components] 실패: ${context.error}`);
  } else {
    console.log('[ui-components] 파이프라인 완료');
  }

  process.exit(exitCode);
}

main();
