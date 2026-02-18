function toPositiveInteger(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  return Math.trunc(numeric);
}

function summarizeCompletedStages(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return '(none)';
  }

  const completed = [];
  const seen = new Set();
  for (const step of steps) {
    if (step?.status !== 'passed') {
      continue;
    }
    const name = String(step?.name ?? '').trim();
    if (!name || seen.has(name)) {
      continue;
    }
    seen.add(name);
    completed.push(name);
  }

  return completed.length > 0 ? completed.join(' -> ') : '(none)';
}

function normalizeSuccessCriteria(successCriteria) {
  if (!Array.isArray(successCriteria)) {
    return [];
  }
  return successCriteria
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
}

function buildStagePosition(context, stageName) {
  const stepIndex = toPositiveInteger(context?.stepDisplayOrder?.[stageName]);
  const plannedStepCount = toPositiveInteger(context?.plannedStepCount);
  if (stepIndex > 0 && plannedStepCount > 0) {
    return `${stepIndex}/${plannedStepCount}`;
  }
  if (stepIndex > 0) {
    return String(stepIndex);
  }
  if (plannedStepCount > 0) {
    return `?/${plannedStepCount}`;
  }
  return 'unknown';
}

function buildPipelineGoal(context) {
  const brief = String(context?.scenario?.intent?.brief ?? '').trim();
  if (!brief) {
    return 'Implement the scenario with aligned design/context gates.';
  }
  return `Implement "${brief}" with aligned design/context gates.`;
}

export function buildRunContextLines(
  context,
  { stageName, stagePurpose, successCriteria = [] }
) {
  const attempt =
    toPositiveInteger(context?.stepAttemptCounts?.[stageName]) || 1;
  const lines = [
    'Run Context:',
    `- Run ID: ${String(context?.runId ?? '(unknown)')}`,
    `- Pipeline goal: ${buildPipelineGoal(context)}`,
    `- Current stage: ${stageName} (${buildStagePosition(context, stageName)}), attempt ${attempt}`,
    `- Stage purpose: ${String(stagePurpose ?? '').trim() || '(not specified)'}`,
    `- Completed stages: ${summarizeCompletedStages(context?.steps)}`,
  ];
  const criteria = normalizeSuccessCriteria(successCriteria);
  if (criteria.length > 0) {
    lines.push(`- Success criteria: ${criteria.join(' / ')}`);
  }
  return lines;
}
