import {
  AGENT_TIMEOUT_BY_PURPOSE_MS,
  PIPELINE_TIMEOUT_MS,
} from './constants.mjs';
import { fail } from './errors.mjs';

function normalizeMs(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.trunc(numeric);
}

function ensurePipelineDeadline(context) {
  if (!context.pipelineTimeoutMs) {
    context.pipelineTimeoutMs = PIPELINE_TIMEOUT_MS;
  }
  if (!context.pipelineDeadlineAt) {
    context.pipelineDeadlineAt = Date.now() + context.pipelineTimeoutMs;
  }
}

function remainingMs(context) {
  ensurePipelineDeadline(context);
  return context.pipelineDeadlineAt - Date.now();
}

export function ensurePipelineRemaining(context, label = 'pipeline') {
  const remaining = remainingMs(context);
  if (remaining <= 0) {
    fail(
      `Pipeline timed out after ${context.pipelineTimeoutMs}ms before ${label}.`
    );
  }
  return remaining;
}

function finalizeTimeoutOrFail(context, label, timeoutMs) {
  if (timeoutMs < 1_000) {
    fail(
      `Pipeline time budget is exhausted before ${label}. Remaining ${Math.max(0, timeoutMs)}ms.`
    );
  }
  return Math.trunc(timeoutMs);
}

export function resolveAgentTimeoutMs(context, purpose, fallbackMs) {
  const requested = normalizeMs(fallbackMs, 60_000);
  const recommended = AGENT_TIMEOUT_BY_PURPOSE_MS[purpose];
  const target =
    Number.isFinite(recommended) && recommended > 0
      ? Math.min(requested, Math.trunc(recommended))
      : requested;
  const remaining = ensurePipelineRemaining(context, purpose);
  return finalizeTimeoutOrFail(context, purpose, Math.min(target, remaining));
}

export function resolveCommandTimeoutMs(context, label, timeoutMs) {
  const requested = normalizeMs(timeoutMs, 60_000);
  const remaining = ensurePipelineRemaining(context, label);
  return finalizeTimeoutOrFail(context, label, Math.min(requested, remaining));
}
