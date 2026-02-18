import { formatNumber } from '../step-utils.mjs';

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

export function buildFigmaMcpToolUsageSummary(context) {
  const summary = createFigmaMcpToolUsageSummary();
  const hasDirectLogCalls = Array.isArray(context.figmaMcpToolLogs?.calls);

  if (hasDirectLogCalls) {
    for (const call of context.figmaMcpToolLogs.calls) {
      accumulateFigmaMcpToolCall(summary, call.tool, call.status);
    }
  }

  if (Array.isArray(context.figmaAssetScope?.calls)) {
    for (const call of context.figmaAssetScope.calls) {
      accumulateFigmaMcpToolCall(summary, call.tool, call.status);
    }
  }

  if (!hasDirectLogCalls) {
    const designTools = context.designTokens?.tools;
    if (designTools && typeof designTools === 'object') {
      for (const [key, value] of Object.entries(designTools)) {
        const toolName = value?.tool || key;
        accumulateFigmaMcpToolCall(summary, toolName, value?.status);
      }
    }
  }

  return summary;
}

export function formatAgentTokenUsage(summary) {
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
