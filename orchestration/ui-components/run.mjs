import { mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { getChangedFiles } from './lib/git-gates.mjs';
import {
  DEFAULT_RETRY_LIMITS,
  runAssetCoverageWithFeedbackLoop,
  runImplementationWithFeedbackLoop,
  runIntentWithFeedbackLoop,
  runPlanWithFeedbackLoop,
} from './lib/feedback-loop.mjs';
import { createRunId, writeReport } from './lib/report.mjs';
import {
  buildFigmaMcpToolUsageSummary,
  formatAgentTokenUsage,
} from './lib/run-summary.mjs';
import { parseArgs, readScenario } from './lib/scenario.mjs';
import { maybeOpenStorybook } from './lib/storybook.mjs';
import { runStep } from './lib/step-runner.mjs';
import { formatNumber } from './lib/step-utils.mjs';
import { stepExtractDesignTokens } from './steps/extract-design-tokens.mjs';
import { stepExtractFigmaAssetScope } from './steps/extract-figma-asset-scope.mjs';
import { stepExtractFigmaMcpToolLogs } from './steps/extract-figma-mcp-tool-logs.mjs';
import { stepExtractFigmaScope } from './steps/extract-figma-scope.mjs';
import { stepExtractIntent } from './steps/extract-intent.mjs';
import { stepGateAssetCoverage } from './steps/gate-figma-asset-coverage.mjs';
import { stepGateChangedPaths } from './steps/gate-changed-paths.mjs';
import { stepGateDesignTokens } from './steps/gate-design-tokens.mjs';
import { stepGateFigmaMcpToolLogs } from './steps/gate-figma-mcp-tool-logs.mjs';
import { stepGateFigmaScope } from './steps/gate-figma-scope.mjs';
import { stepGateIntent } from './steps/gate-intent.mjs';
import { stepPreflight } from './steps/preflight.mjs';
import { stepResolveComponent } from './steps/resolve-component-plan.mjs';
import { stepRunAgent } from './steps/run-agent-implementation.mjs';
import { stepVerify } from './steps/verify.mjs';

const RETRY_LIMITS = DEFAULT_RETRY_LIMITS;
const PLANNED_STEP_COUNT = 15;
const STEP_DIVIDER =
  '------------------------------------------------------------';
const STEP_DISPLAY_ORDER = Object.freeze({
  preflight: 1,
  'extract-intent': 2,
  'gate-intent': 3,
  'extract-figma-scope': 4,
  'gate-figma-scope': 5,
  'extract-figma-mcp-tool-logs': 6,
  'gate-figma-mcp-tool-logs': 7,
  'extract-design-tokens': 8,
  'gate-design-tokens': 9,
  'extract-figma-asset-scope': 10,
  'gate-figma-asset-coverage': 11,
  'resolve-component-plan': 12,
  'run-agent-implementation': 13,
  'gate-changed-paths': 14,
  verify: 15,
});

function createContext(args, scenario, runId, rootPath, artifactsDir) {
  return {
    runId,
    rootPath,
    artifactsDir,
    plannedStepCount: PLANNED_STEP_COUNT,
    stepDisplayOrder: STEP_DISPLAY_ORDER,
    stepAttemptCounts: {},
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
    figmaAssetScopeArtifactPath: null,
    figmaAssetScope: null,
    figmaAssetCoverageArtifactPath: null,
    figmaAssetCoverageGate: null,
    componentPlan: null,
    implementationResult: null,
    storybookOpenResult: null,
    agentTraceArtifacts: [],
    initialChangedFiles: getChangedFiles(rootPath),
    newChangedFiles: [],
    verificationResults: [],
    figmaMcpToolUsage: null,
    agentTokenUsage: null,
    agentMcpToolUsage: null,
    feedbackLoop: {
      intent: [],
      asset: [],
      plan: [],
      implement: [],
      verify: [],
    },
    feedbackHistory: [],
  };
}

function printFinalSummary(context, reportResult) {
  const reportPath = reportResult.reportPath;
  const passedSteps = context.steps.filter(
    (step) => step.status === 'passed'
  ).length;
  const totalSteps = context.steps.length;

  console.log('');
  console.log('[ui-components]');
  console.log(STEP_DIVIDER);
  console.log('[summary]');
  console.log(`- 단계 요약: ${passedSteps}/${totalSteps} 통과`);
  if (context.storybookOpenResult?.status === 'opened') {
    console.log(`- Storybook 열기: 완료`);
    console.log(`- Storybook URL: ${context.storybookOpenResult.url}`);
  } else if (
    context.storybookOpenResult &&
    context.storybookOpenResult.status !== 'skipped'
  ) {
    console.log(`- Storybook 열기: 실패`);
    console.log(`- Storybook 사유: ${context.storybookOpenResult.reason}`);
  }
  if (context.warnings.length > 0) {
    console.log(`- 경고: ${context.warnings.length}건`);
  }
  if (context.figmaMcpToolUsage.totalCalls > 0) {
    console.log(
      `- Figma MCP 도구 호출: 총 ${formatNumber(context.figmaMcpToolUsage.totalCalls)}회 (성공 ${formatNumber(context.figmaMcpToolUsage.successCalls)}, 실패 ${formatNumber(context.figmaMcpToolUsage.failedCalls)}, 미가용 ${formatNumber(context.figmaMcpToolUsage.unavailableCalls)})`
    );
  }
  const agentTokenUsageText = formatAgentTokenUsage(context.agentTokenUsage);
  if (agentTokenUsageText) {
    console.log(`- 에이전트 토큰: ${agentTokenUsageText}`);
  }
  console.log(
    `- 리포트 인덱스: ${relative(context.rootPath, reportResult.indexPath)} (${reportResult.indexEntryCount}건)`
  );
  if (reportResult.retention.removedReportCount > 0) {
    console.log(
      `- 정리: 리포트 ${reportResult.retention.removedReportCount}건, 아티팩트 엔트리 ${reportResult.retention.removedArtifactEntries}건 삭제 (보관 기준: 최근 7일/최근 10런)`
    );
  }
  console.log(`- 리포트: ${relative(context.rootPath, reportPath)}`);

  if (context.status === 'failed') {
    console.error(`- 실패: ${context.error}`);
    console.log(STEP_DIVIDER);
    console.log('');
    return;
  }
  console.log('- 파이프라인 완료');
  console.log(STEP_DIVIDER);
  console.log('');
}

async function executePipeline(context) {
  runStep(context, 'preflight', stepPreflight);
  await runIntentWithFeedbackLoop(context, {
    retryLimits: RETRY_LIMITS,
    runStep,
    stepExtractIntent,
    stepGateIntent,
  });
  runStep(context, 'extract-figma-scope', stepExtractFigmaScope);
  runStep(context, 'gate-figma-scope', stepGateFigmaScope);
  runStep(context, 'extract-figma-mcp-tool-logs', stepExtractFigmaMcpToolLogs);
  runStep(context, 'gate-figma-mcp-tool-logs', stepGateFigmaMcpToolLogs);
  runStep(context, 'extract-design-tokens', stepExtractDesignTokens);
  runStep(context, 'gate-design-tokens', stepGateDesignTokens);
  await runAssetCoverageWithFeedbackLoop(context, {
    retryLimits: RETRY_LIMITS,
    runStep,
    stepExtractFigmaAssetScope,
    stepGateAssetCoverage,
  });
  await runPlanWithFeedbackLoop(context, {
    retryLimits: RETRY_LIMITS,
    runStep,
    stepResolveComponent,
  });
  await runImplementationWithFeedbackLoop(context, {
    retryLimits: RETRY_LIMITS,
    runStep,
    stepRunAgent,
    stepGateChangedPaths,
    stepVerify,
  });
  context.status = 'passed';
  context.storybookOpenResult = maybeOpenStorybook(context);
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

  const context = createContext(args, scenario, runId, rootPath, artifactsDir);

  let exitCode = 0;
  try {
    await executePipeline(context);
  } catch (error) {
    context.status = 'failed';
    context.error = error instanceof Error ? error.message : String(error);
    exitCode = 1;
  }

  context.figmaMcpToolUsage = buildFigmaMcpToolUsageSummary(context);
  const reportResult = writeReport(context);
  printFinalSummary(context, reportResult);
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(
    `[ui-components] 치명적 오류: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
