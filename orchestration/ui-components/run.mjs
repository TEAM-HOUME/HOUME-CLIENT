import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { relative, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';

import { runCommand } from './lib/agent.mjs';
import { getChangedFiles } from './lib/git-gates.mjs';
import { createRunId, writeReport } from './lib/report.mjs';
import { parseArgs, readScenario } from './lib/scenario.mjs';
import { stepExtractIntent } from './steps/extract-intent.mjs';
import { stepGateIntent } from './steps/gate-intent.mjs';
import { stepExtractFigmaScope } from './steps/extract-figma-scope.mjs';
import { stepGateFigmaScope } from './steps/gate-figma-scope.mjs';
import { stepExtractFigmaMcpToolLogs } from './steps/extract-figma-mcp-tool-logs.mjs';
import { stepGateFigmaMcpToolLogs } from './steps/gate-figma-mcp-tool-logs.mjs';
import { stepExtractDesignTokens } from './steps/extract-design-tokens.mjs';
import { stepGateDesignTokens } from './steps/gate-design-tokens.mjs';
import { stepGateChangedPaths } from './steps/gate-changed-paths.mjs';
import { stepPreflight } from './steps/preflight.mjs';
import { stepResolveComponent } from './steps/resolve-component-plan.mjs';
import { stepRunAgent } from './steps/run-agent-implementation.mjs';
import { stepVerify } from './steps/verify.mjs';

const RETRY_LIMITS = Object.freeze({
  intent: 3,
  plan: 3,
  implement: 3,
  verify: 3,
});

const STAGE_LABELS = Object.freeze({
  intent: '의도',
  plan: '계획',
  implement: '구현',
  verify: '검증',
});

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

function createFigmaMcpToolUsageSummary() {
  return {
    totalCalls: 0,
    successCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
    callsByTool: {},
  };
}

function normalizeMcpOutcome(status) {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  if (
    normalized === 'ok' ||
    normalized === 'partial' ||
    normalized === 'no_mapping'
  ) {
    return 'success';
  }
  if (normalized === 'unavailable') {
    return 'unavailable';
  }
  return 'failed';
}

function accumulateFigmaMcpToolCall(summary, toolName, status) {
  const normalizedToolName = String(toolName || 'unknown_tool').trim();
  const normalizedStatus = String(status ?? 'unknown')
    .trim()
    .toLowerCase();
  const outcome = normalizeMcpOutcome(normalizedStatus);

  if (!summary.callsByTool[normalizedToolName]) {
    summary.callsByTool[normalizedToolName] = {
      calls: 0,
      successCalls: 0,
      failedCalls: 0,
      unavailableCalls: 0,
      statuses: {},
    };
  }

  const toolSummary = summary.callsByTool[normalizedToolName];
  toolSummary.calls += 1;
  toolSummary.statuses[normalizedStatus] =
    (toolSummary.statuses[normalizedStatus] ?? 0) + 1;

  summary.totalCalls += 1;
  if (outcome === 'success') {
    summary.successCalls += 1;
    toolSummary.successCalls += 1;
    return;
  }
  if (outcome === 'unavailable') {
    summary.unavailableCalls += 1;
    toolSummary.unavailableCalls += 1;
    return;
  }

  summary.failedCalls += 1;
  toolSummary.failedCalls += 1;
}

function buildFigmaMcpToolUsageSummary(context) {
  const summary = createFigmaMcpToolUsageSummary();

  if (Array.isArray(context.figmaMcpToolLogs?.calls)) {
    for (const call of context.figmaMcpToolLogs.calls) {
      accumulateFigmaMcpToolCall(summary, call.tool, call.status);
    }
    return summary;
  }

  const designTools = context.designTokens?.tools;
  if (designTools && typeof designTools === 'object') {
    for (const [key, value] of Object.entries(designTools)) {
      const toolName = value?.tool || key;
      accumulateFigmaMcpToolCall(summary, toolName, value?.status);
    }
  }

  return summary;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

function formatAgentTokenUsage(summary) {
  if (
    !summary ||
    !Array.isArray(summary.records) ||
    summary.records.length === 0
  ) {
    return null;
  }

  const missingCount = summary.missingCount ?? 0;
  if (missingCount === summary.records.length) {
    return `사용량 미수집 (호출 ${summary.records.length}회)`;
  }

  const missingText =
    missingCount > 0 ? `, 미수집 ${formatNumber(missingCount)}회` : '';
  return `입력 ${formatNumber(summary.totalInputTokens)}, 출력 ${formatNumber(summary.totalOutputTokens)}, 합계 ${formatNumber(summary.totalTokens)}${missingText}`;
}

function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function createPromptInterface(stage) {
  if (isInteractiveTerminal()) {
    return {
      rl: createInterface({
        input: process.stdin,
        output: process.stdout,
      }),
      dispose() {},
      source: 'stdio',
    };
  }

  try {
    const ttyInput = createReadStream('/dev/tty');
    const ttyOutput = createWriteStream('/dev/tty');
    return {
      rl: createInterface({
        input: ttyInput,
        output: ttyOutput,
      }),
      dispose() {
        ttyInput.destroy();
        ttyOutput.end();
      },
      source: '/dev/tty',
    };
  } catch {
    console.log(
      `[ui-components] [${stage}] 입력 채널을 열 수 없어 종료합니다 (non-TTY & /dev/tty unavailable)`
    );
    return null;
  }
}

function normalizeRetryAnswer(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return !(normalized === 'n' || normalized === 'no');
}

async function promptRetryDecision(stage, attempt, maxAttempts, errorMessage) {
  const stageLabel = STAGE_LABELS[stage] || stage;
  const remaining = Math.max(0, maxAttempts - attempt);
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts}) - ${truncateText(errorMessage, 220)}`
  );

  const promptInterface = createPromptInterface(stage);
  if (!promptInterface) {
    return {
      retry: false,
      note: '',
    };
  }

  const { rl, dispose, source } = promptInterface;

  try {
    if (source === '/dev/tty') {
      console.log(
        `[ui-components] [${stage}] non-TTY 환경 감지: /dev/tty로 입력을 받습니다`
      );
    }
    const retryAnswer = await rl.question(
      `[ui-components] [${stage}] 재시도하시겠습니까? (Y/n, 남은 ${remaining}회): `
    );
    const retry = normalizeRetryAnswer(retryAnswer);
    if (!retry) {
      return {
        retry: false,
        note: '',
      };
    }

    const note = (
      await rl.question(
        `[ui-components] [${stage}] 보강 지시를 입력하세요 (없으면 Enter): `
      )
    ).trim();
    return {
      retry: true,
      note,
    };
  } finally {
    rl.close();
    dispose();
  }
}

function appendFeedback(context, stage, value) {
  if (!value || !context.feedbackLoop?.[stage]) {
    return;
  }
  context.feedbackLoop[stage].push(String(value).trim());
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
    return `스코프=${output.selectedNodeId}, 소스=${output.source}, 판정=${output.scopeVerdict}, 상위탐색=${parentDepth}단계`;
  }
  if (name === 'extract-intent') {
    const ambiguityCount = Array.isArray(output.ambiguities)
      ? output.ambiguities.length
      : 0;
    return `유형=${output.componentKind}, 역할=${output.role}, 상태=${output.state || '(none)'}, 신뢰도=${Number(output.confidence || 0).toFixed(2)}, 모호점=${ambiguityCount}개`;
  }
  if (name === 'gate-intent') {
    return `모드=${output.mode}, 상태=${output.status}, 신뢰도=${Number(output.confidence || 0).toFixed(2)} (기준 ${Number(output.minConfidence || 0).toFixed(2)})`;
  }
  if (name === 'gate-figma-scope') {
    return `상태=${output.status}, 판정=${output.scopeVerdict}, 상위탐색=${output.parentDepth}단계`;
  }
  if (name === 'extract-figma-mcp-tool-logs') {
    return `도구=${output.tools}개, 성공=${output.okCalls}개, 실패=${output.failedCalls}개, 미가용=${output.unavailableCalls}개, auth-env=${output.authTokenEnv || '(none)'}`;
  }
  if (name === 'gate-figma-mcp-tool-logs') {
    return `상태=${output.status}, 검사=${output.checkedTools}개, 누락=${output.missingTools?.length ?? 0}개, 오류=${output.badTools?.length ?? 0}개`;
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

  if (name === 'extract-intent') {
    if (output.behaviorNeeded) {
      console.log(`${stepPrefix(name)} └ 동작정의 필요: 예`);
    }
    const ambiguities = compactArray(output.ambiguities, 2);
    for (const ambiguity of ambiguities) {
      console.log(`${stepPrefix(name)} └ 모호점: ${ambiguity}`);
    }
    if (
      Array.isArray(output.ambiguities) &&
      output.ambiguities.length > ambiguities.length
    ) {
      console.log(
        `${stepPrefix(name)} └ 모호점: 외 ${output.ambiguities.length - ambiguities.length}건`
      );
    }
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
      `${stepPrefix(name)} └ 조치: 스코프 판정(scopeVerdict)을 확인하고 figma.scope_node_id 또는 brief/intent 힌트를 보강하세요`
    );
  }
  if (name === 'gate-intent') {
    console.log(
      `${stepPrefix(name)} └ 조치: brief 보강 또는 intent 힌트(page/component_kind/role/state) 추가 필요`
    );
  }
  if (name === 'gate-figma-mcp-tool-logs') {
    console.log(
      `${stepPrefix(name)} └ 조치: figma MCP 원본 응답 로그(artifacts/*-figma-mcp-tool-logs.json)에서 실패 도구를 확인`
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

async function runPlanWithFeedbackLoop(context) {
  for (let attempt = 1; attempt <= RETRY_LIMITS.plan; attempt += 1) {
    try {
      runStep(context, 'resolve-component-plan', stepResolveComponent);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (attempt >= RETRY_LIMITS.plan) {
        throw error;
      }

      const decision = await promptRetryDecision(
        'plan',
        attempt,
        RETRY_LIMITS.plan,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }
      appendFeedback(
        context,
        'plan',
        decision.note ||
          `Previous plan failure: ${truncateText(errorMessage, 240)}`
      );
    }
  }
}

async function runIntentWithFeedbackLoop(context) {
  for (let attempt = 1; attempt <= RETRY_LIMITS.intent; attempt += 1) {
    try {
      runStep(context, 'extract-intent', stepExtractIntent);
      runStep(context, 'gate-intent', stepGateIntent);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (attempt >= RETRY_LIMITS.intent) {
        throw error;
      }

      const decision = await promptRetryDecision(
        'intent',
        attempt,
        RETRY_LIMITS.intent,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }

      appendFeedback(
        context,
        'intent',
        decision.note ||
          `Previous intent failure: ${truncateText(errorMessage, 240)}`
      );
    }
  }
}

async function runImplementationWithFeedbackLoop(context) {
  let verifyAttempt = 0;

  for (
    let implementAttempt = 1;
    implementAttempt <= RETRY_LIMITS.implement;
    implementAttempt += 1
  ) {
    try {
      runStep(context, 'run-agent-implementation', stepRunAgent);
      runStep(context, 'gate-changed-paths', stepGateChangedPaths);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (implementAttempt >= RETRY_LIMITS.implement) {
        throw error;
      }

      const decision = await promptRetryDecision(
        'implement',
        implementAttempt,
        RETRY_LIMITS.implement,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }
      appendFeedback(
        context,
        'implement',
        decision.note ||
          `Previous implement/path-gate failure: ${truncateText(errorMessage, 240)}`
      );
      continue;
    }

    if (context.options.skipVerify) {
      runStep(context, 'verify', () => {
        return {
          skipped: true,
          reason: '--skip-verify option',
        };
      });
      return;
    }

    try {
      runStep(context, 'verify', stepVerify);
      return;
    } catch (error) {
      verifyAttempt += 1;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (verifyAttempt >= RETRY_LIMITS.verify) {
        throw error;
      }

      const decision = await promptRetryDecision(
        'verify',
        verifyAttempt,
        RETRY_LIMITS.verify,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }

      appendFeedback(
        context,
        'verify',
        decision.note ||
          `Previous verify failure: ${truncateText(errorMessage, 240)}`
      );
      appendFeedback(
        context,
        'implement',
        `Fix verify failure before next validation: ${truncateText(errorMessage, 240)}`
      );
      if (decision.note) {
        appendFeedback(context, 'implement', decision.note);
      }
    }
  }

  throw new Error(
    `Implementation retry limit exceeded (${RETRY_LIMITS.implement}).`
  );
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

async function main() {
  const args = parseArgs(process.argv);
  if (!args.scenarioArg) {
    console.error(
      '[ui-components] 사용법: pnpm ui:run --scenario orchestration/ui-components/scenarios/<name>.yml [--dry-run] [--approve-visual] [--skip-verify] [--open-storybook]'
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
    resolvedIntent: null,
    intentArtifactPath: null,
    intentGate: null,
    figmaScope: null,
    designContextArtifactPath: null,
    figmaScopeGate: null,
    figmaMcpToolLogs: null,
    figmaMcpToolLogsArtifactPath: null,
    figmaMcpToolLogsGate: null,
    figmaMcpDirectToolRecords: null,
    designTokensArtifactPath: null,
    designTokens: null,
    designTokensGate: null,
    componentPlan: null,
    implementationResult: null,
    storybookOpenResult: null,
    agentTraceArtifacts: [],
    initialChangedFiles: getChangedFiles(rootPath),
    newChangedFiles: [],
    verificationResults: [],
    figmaMcpToolUsage: null,
    agentTokenUsage: null,
    feedbackLoop: {
      intent: [],
      plan: [],
      implement: [],
      verify: [],
    },
  };

  let exitCode = 0;

  try {
    runStep(context, 'preflight', stepPreflight);
    await runIntentWithFeedbackLoop(context);
    runStep(context, 'extract-figma-scope', stepExtractFigmaScope);
    runStep(context, 'gate-figma-scope', stepGateFigmaScope);
    runStep(
      context,
      'extract-figma-mcp-tool-logs',
      stepExtractFigmaMcpToolLogs
    );
    runStep(context, 'gate-figma-mcp-tool-logs', stepGateFigmaMcpToolLogs);
    runStep(context, 'extract-design-tokens', stepExtractDesignTokens);
    runStep(context, 'gate-design-tokens', stepGateDesignTokens);
    await runPlanWithFeedbackLoop(context);
    await runImplementationWithFeedbackLoop(context);
    context.status = 'passed';
    context.storybookOpenResult = maybeOpenStorybook(context);
  } catch (error) {
    context.status = 'failed';
    context.error = error instanceof Error ? error.message : String(error);
    exitCode = 1;
  }

  context.figmaMcpToolUsage = buildFigmaMcpToolUsageSummary(context);
  const reportResult = writeReport(context);
  const reportPath = reportResult.reportPath;
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
  if (context.figmaMcpToolUsage.totalCalls > 0) {
    console.log(
      `[ui-components] Figma MCP 도구 호출: 총 ${formatNumber(context.figmaMcpToolUsage.totalCalls)}회 (성공 ${formatNumber(context.figmaMcpToolUsage.successCalls)}, 실패 ${formatNumber(context.figmaMcpToolUsage.failedCalls)}, 미가용 ${formatNumber(context.figmaMcpToolUsage.unavailableCalls)})`
    );
  }
  const agentTokenUsageText = formatAgentTokenUsage(context.agentTokenUsage);
  if (agentTokenUsageText) {
    console.log(`[ui-components] 에이전트 토큰: ${agentTokenUsageText}`);
  }
  console.log(
    `[ui-components] 리포트 인덱스: ${relative(context.rootPath, reportResult.indexPath)} (${reportResult.indexEntryCount}건)`
  );
  if (reportResult.retention.removedReportCount > 0) {
    console.log(
      `[ui-components] 정리: 리포트 ${reportResult.retention.removedReportCount}건, 아티팩트 엔트리 ${reportResult.retention.removedArtifactEntries}건 삭제 (보관 기준: 최근 7일/최근 10런)`
    );
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

main().catch((error) => {
  console.error(
    `[ui-components] 치명적 오류: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
