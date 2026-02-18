import { spawn } from 'node:child_process';

import {
  logStepDetails,
  logStepFailureHint,
  summarizeStepOutput,
} from './run-summary.mjs';
import { formatDuration, splitErrorDetails } from './step-utils.mjs';
import { ensurePipelineRemaining } from './timeout-budget.mjs';

const HEARTBEAT_INTERVAL_MS = 15_000;
const STEP_DIVIDER =
  '------------------------------------------------------------';
const HEARTBEAT_TEMPLATE = '[{label}] 진행중... {elapsed}s 경과';
const HEARTBEAT_STEPS = new Set([
  'extract-intent',
  'extract-figma-scope',
  'extract-design-tokens',
  'extract-figma-asset-scope',
  'gate-figma-asset-coverage',
  'resolve-component-plan',
  'run-agent-implementation',
  'verify',
]);

function startStepHeartbeat(stepLabel) {
  const script = `
const label = ${JSON.stringify(stepLabel)};
const template = ${JSON.stringify(HEARTBEAT_TEMPLATE)};
const startedAt = Date.now();
const intervalMs = ${HEARTBEAT_INTERVAL_MS};
const timer = setInterval(() => {
  const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
  const message = template
    .replace('{label}', label)
    .replace('{elapsed}', String(elapsedSec));
  console.log(message);
}, intervalMs);
const close = () => {
  clearInterval(timer);
  process.exit(0);
};
process.on('SIGINT', close);
process.on('SIGTERM', close);
`;

  const child = spawn(process.execPath, ['-e', script], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.unref();
  return child;
}

function stopStepHeartbeat(timer) {
  if (!timer || timer.killed) {
    return;
  }
  timer.kill('SIGTERM');
}

export function runStep(context, name, handler) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const traceCountBefore = context.agentTraceArtifacts.length;
  const stepSequence = context.steps.length + 1;
  const plannedStepCount = Number(context.plannedStepCount || 0);
  const displayStepIndex = Number(context.stepDisplayOrder?.[name] || 0);
  const stepIndex = displayStepIndex > 0 ? displayStepIndex : stepSequence;
  const nextAttempt = (context.stepAttemptCounts?.[name] || 0) + 1;
  if (context.stepAttemptCounts) {
    context.stepAttemptCounts[name] = nextAttempt;
  }
  const stepCounterText =
    plannedStepCount > 0
      ? ` (${stepIndex}/${plannedStepCount})`
      : ` (${stepIndex})`;
  const stepAttemptText = nextAttempt > 1 ? ` [시도 ${nextAttempt}]` : '';
  const stepLabelForHeartbeat = `${name}${stepCounterText}${stepAttemptText}`;
  const stepLog = {
    name,
    stepSequence,
    stepIndex,
    stepAttempt: nextAttempt,
    plannedStepCount: plannedStepCount > 0 ? plannedStepCount : null,
    status: 'running',
    startedAt,
  };
  context.steps.push(stepLog);
  console.log('');
  console.log('[ui-components]');
  console.log(STEP_DIVIDER);
  console.log(`[${name}]${stepCounterText}${stepAttemptText}`);
  console.log('- 시작');
  const heartbeatProcess =
    !context.options?.dryRun && HEARTBEAT_STEPS.has(name)
      ? startStepHeartbeat(stepLabelForHeartbeat)
      : null;

  try {
    ensurePipelineRemaining(context, name);
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
    stopStepHeartbeat(heartbeatProcess);
    stepLog.finishedAt = new Date().toISOString();
    stepLog.durationMs = Date.now() - startedMs;
    const stepTraceRecords =
      context.agentTraceArtifacts.slice(traceCountBefore);
    stepLog.traceArtifacts = stepTraceRecords;
    const durationText = formatDuration(stepLog.durationMs);
    if (stepLog.status === 'passed') {
      const summary = summarizeStepOutput(name, stepLog.output);
      console.log(`- 통과 (${durationText})`);
      if (summary) {
        console.log(`- ${summary}`);
      }
      logStepDetails(name, stepLog.output, stepTraceRecords);
      console.log(STEP_DIVIDER);
      console.log('');
      return;
    }
    const errorDetails = splitErrorDetails(stepLog.error);
    console.log(`- 실패 (${durationText})`);
    if (errorDetails.summary) {
      console.log(`- 사유: ${errorDetails.summary}`);
    }
    if (errorDetails.details.length > 0) {
      errorDetails.details.forEach((detail, index) => {
        console.log(`  - 상세 ${index + 1}: ${detail}`);
      });
    }
    logStepFailureHint(context, name, stepTraceRecords);
    console.log(STEP_DIVIDER);
    console.log('');
  }
}
