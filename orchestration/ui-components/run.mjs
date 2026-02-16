import { existsSync, mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runCommand } from './lib/agent.mjs';
import { getChangedFiles } from './lib/git-gates.mjs';
import { createRunId, writeReport } from './lib/report.mjs';
import { parseArgs, readScenario } from './lib/scenario.mjs';
import { stepExtractFigmaScope } from './steps/extract-figma-scope.mjs';
import { stepGateFigmaScope } from './steps/gate-figma-scope.mjs';
import { stepExtractDesignTokens } from './steps/extract-design-tokens.mjs';
import { stepGateDesignTokens } from './steps/gate-design-tokens.mjs';
import { stepExtractCodeConnectMap } from './steps/extract-code-connect-map.mjs';
import { stepGateCodeConnect } from './steps/gate-code-connect.mjs';
import { stepGateChangedPaths } from './steps/gate-changed-paths.mjs';
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

function toSingleLine(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function truncateText(value, maxLength = 160) {
  const normalized = toSingleLine(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function compactArray(values, maxItems = 3) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.slice(0, maxItems).map((value) => truncateText(value, 180));
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
    const parentDepth = Array.isArray(output.parentChain)
      ? output.parentChain.length
      : 0;
    return `스코프=${output.selectedNodeId}, 소스=${output.source}, 상위탐색=${parentDepth}단계`;
  }
  if (name === 'gate-figma-scope') {
    return `상태=${output.status}, 협소=${output.isNarrow ? '예' : '아니오'}, 상위탐색=${output.parentDepth}단계`;
  }
  if (name === 'extract-design-tokens') {
    return `상태=${output.status}, 토큰=${output.totalTokens}개, 코어커버리지=${output.coreCoverage}/3`;
  }
  if (name === 'gate-design-tokens') {
    return `모드=${output.mode}, 상태=${output.status}, 토큰=${output.totalTokens}개`;
  }
  if (name === 'resolve-component-plan') {
    return `계획=${output.action}, 대상=${output.targetPath}, 소스=${output.source}`;
  }
  if (name === 'run-agent-implementation') {
    const changedCount = Array.isArray(output.changedFiles)
      ? output.changedFiles.length
      : 0;
    const summary = output.summary
      ? `, 요약=${truncateText(output.summary, 80)}`
      : '';
    return `변경 파일=${changedCount}개${summary}`;
  }
  if (name === 'gate-changed-paths') {
    return `검사 파일=${output.checkedFiles}개`;
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

function stepPrefix(name) {
  return `[ui-components] [${name}]`;
}

function logStepDetails(name, output, traceRecords) {
  if (!output || typeof output !== 'object' || output.skipped) {
    return;
  }

  if (name === 'extract-figma-scope' && output.rationale) {
    console.log(
      `${stepPrefix(name)} └ 스코프 판단: ${truncateText(output.rationale, 200)}`
    );
  }

  if (name === 'extract-design-tokens') {
    const warnings = compactArray(output.warnings, 2);
    for (const warning of warnings) {
      console.log(`${stepPrefix(name)} └ 토큰 경고: ${warning}`);
    }
    if (
      Array.isArray(output.warnings) &&
      output.warnings.length > warnings.length
    ) {
      console.log(
        `${stepPrefix(name)} └ 토큰 경고: 외 ${output.warnings.length - warnings.length}건`
      );
    }

    const errors = compactArray(output.errors, 2);
    for (const error of errors) {
      console.log(`${stepPrefix(name)} └ 토큰 오류: ${error}`);
    }
    if (Array.isArray(output.errors) && output.errors.length > errors.length) {
      console.log(
        `${stepPrefix(name)} └ 토큰 오류: 외 ${output.errors.length - errors.length}건`
      );
    }
  }

  if (name === 'run-agent-implementation') {
    if (output.summary) {
      console.log(
        `${stepPrefix(name)} └ 에이전트 요약: ${truncateText(output.summary, 220)}`
      );
    }

    const notes = compactArray(output.notes, 3);
    for (const note of notes) {
      console.log(`${stepPrefix(name)} └ 에이전트 노트: ${note}`);
    }
    if (Array.isArray(output.notes) && output.notes.length > notes.length) {
      console.log(
        `${stepPrefix(name)} └ 에이전트 노트: 외 ${output.notes.length - notes.length}건`
      );
    }
  }

  if (name === 'resolve-component-plan') {
    if (output.rationale) {
      console.log(
        `${stepPrefix(name)} └ 계획 근거: ${truncateText(output.rationale, 220)}`
      );
    }
    const questions = compactArray(output.behaviorQuestions, 2);
    for (const question of questions) {
      console.log(`${stepPrefix(name)} └ 동작 확인 질문: ${question}`);
    }
    if (
      Array.isArray(output.behaviorQuestions) &&
      output.behaviorQuestions.length > questions.length
    ) {
      console.log(
        `${stepPrefix(name)} └ 동작 확인 질문: 외 ${output.behaviorQuestions.length - questions.length}건`
      );
    }
  }

  if (name === 'extract-code-connect-map') {
    const notes = compactArray(output.notes, 2);
    for (const note of notes) {
      console.log(`${stepPrefix(name)} └ 코드커넥트 노트: ${note}`);
    }
    if (Array.isArray(output.notes) && output.notes.length > notes.length) {
      console.log(
        `${stepPrefix(name)} └ 코드커넥트 노트: 외 ${output.notes.length - notes.length}건`
      );
    }
  }

  const latestTrace = traceRecords.at(-1);
  if (!latestTrace) {
    return;
  }

  const tracePath =
    latestTrace.parsedPath ||
    latestTrace.stdoutPath ||
    latestTrace.metadataPath;
  if (tracePath) {
    console.log(`${stepPrefix(name)} └ trace: ${tracePath}`);
  }
}

function logStepFailureHint(name, traceRecords) {
  if (name === 'gate-design-tokens') {
    console.log(
      `${stepPrefix(name)} └ 조치: design token capture 상태/도구 오류를 artifact에서 확인`
    );
  }
  if (name === 'gate-figma-scope') {
    console.log(
      `${stepPrefix(name)} └ 조치: 노드가 넓게 선택됐습니다. figma.scope_node_id 지정 또는 노드 범위 축소 필요`
    );
  }

  const latestTrace = traceRecords.at(-1);
  if (!latestTrace) {
    return;
  }

  const tracePath =
    latestTrace.parsedPath ||
    latestTrace.stdoutPath ||
    latestTrace.metadataPath;
  if (tracePath) {
    console.log(`${stepPrefix(name)} └ 실패 trace: ${tracePath}`);
  }
}

function runStep(context, name, handler) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const traceCountBefore = context.agentTraceArtifacts.length;
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
    const stepTraceRecords =
      context.agentTraceArtifacts.slice(traceCountBefore);
    stepLog.traceArtifacts = stepTraceRecords;
    const durationText = formatDuration(stepLog.durationMs);
    if (stepLog.status === 'passed') {
      const summary = summarizeStepOutput(name, stepLog.output);
      console.log(
        `[ui-components] [${name}] 통과 (${durationText})${summary ? ` - ${summary}` : ''}`
      );
      logStepDetails(name, stepLog.output, stepTraceRecords);
      return;
    }
    console.log(
      `[ui-components] [${name}] 실패 (${durationText}) - ${stepLog.error}`
    );
    logStepFailureHint(name, stepTraceRecords);
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
    figmaScopeGate: null,
    designTokensArtifactPath: null,
    designTokens: null,
    designTokensGate: null,
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
    runStep(context, 'gate-figma-scope', stepGateFigmaScope);
    runStep(context, 'extract-design-tokens', stepExtractDesignTokens);
    runStep(context, 'gate-design-tokens', stepGateDesignTokens);
    runStep(context, 'resolve-component-plan', stepResolveComponent);
    runStep(context, 'run-agent-implementation', stepRunAgent);
    runStep(context, 'gate-changed-paths', stepGateChangedPaths);
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
