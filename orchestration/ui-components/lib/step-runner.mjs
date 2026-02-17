import {
  logStepDetails,
  logStepFailureHint,
  summarizeStepOutput,
} from './run-summary.mjs';
import { formatDuration } from './step-utils.mjs';

export function runStep(context, name, handler) {
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
