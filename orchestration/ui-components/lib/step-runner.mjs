import {
  logStepDetails,
  logStepFailureHint,
  summarizeStepOutput,
} from './run-summary.mjs';
import { formatDuration } from './step-utils.mjs';

const HEARTBEAT_INTERVAL_MS = 15_000;
const STEP_DIVIDER =
  '------------------------------------------------------------';
const HEARTBEAT_STEPS = new Set([
  'extract-intent',
  'extract-figma-scope',
  'extract-figma-mcp-tool-logs',
  'extract-design-tokens',
  'resolve-component-plan',
  'run-agent-implementation',
  'verify',
]);

function startStepHeartbeat(stepLabel) {
  const started = Date.now();
  return setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - started) / 1000);
    console.log(`[ui-components] [${stepLabel}] 진행중... ${elapsedSec}s 경과`);
  }, HEARTBEAT_INTERVAL_MS);
}

function stopStepHeartbeat(timer) {
  if (!timer) {
    return;
  }
  clearInterval(timer);
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
    console.log(`- 실패 (${durationText}) - ${stepLog.error}`);
    logStepFailureHint(name, stepTraceRecords);
    console.log(STEP_DIVIDER);
    console.log('');
  }
}
