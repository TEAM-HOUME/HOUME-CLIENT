import { getLatestAgentMcpUsageRecord } from './agent/trace.mjs';
import { fail } from './errors.mjs';

export const FIGMA_REQUIRED_TOOLS = Object.freeze([
  'get_design_context',
  'get_variable_defs',
  'get_metadata',
  'get_screenshot',
]);

const MAX_TOTAL_MCP_CALLS_PER_RUN = 120;

const PURPOSE_POLICIES = Object.freeze({
  'figma-scope': {
    maxCalls: 12,
    maxFailedCalls: 4,
    requireCalls: true,
  },
  'figma-mcp-tool-logs': {
    maxCalls: 16,
    maxFailedCalls: 4,
    requireCalls: true,
    requiredTools: FIGMA_REQUIRED_TOOLS,
  },
  'design-tokens': {
    maxCalls: 12,
    maxFailedCalls: 4,
    requireCalls: true,
    requiredTools: FIGMA_REQUIRED_TOOLS,
  },
  'figma-asset-scope': {
    maxCalls: 24,
    maxFailedCalls: 8,
    requireCalls: true,
  },
  'figma-asset-coverage': {
    maxCalls: 8,
    maxFailedCalls: 4,
    requireCalls: false,
  },
});

export function getMcpGuardrailPolicy(purpose) {
  const policy = PURPOSE_POLICIES[purpose];
  if (!policy) {
    return null;
  }
  return {
    ...policy,
    requiredTools: Array.isArray(policy.requiredTools)
      ? [...policy.requiredTools]
      : [],
  };
}

function normalizeToolName(value) {
  return String(value || '').trim();
}

function summarizeToolPresence(calls) {
  const seen = new Set();
  for (const call of calls) {
    seen.add(normalizeToolName(call.tool));
  }
  return seen;
}

export function enforceMcpGuardrails(context, purpose, overrides = {}) {
  const record = getLatestAgentMcpUsageRecord(context, purpose);
  const policy = {
    ...(PURPOSE_POLICIES[purpose] || {}),
    ...overrides,
  };

  if (!record) {
    if (policy.requireCalls) {
      fail(`MCP guardrail: ${purpose} 단계에서 MCP 호출 기록이 없습니다.`);
    }
    return {
      purpose,
      totalCalls: 0,
      failedCalls: 0,
      unavailableCalls: 0,
      requiredToolsMissing: [],
    };
  }

  const maxCalls = Number.isFinite(policy.maxCalls) ? policy.maxCalls : 20;
  const maxFailedCalls = Number.isFinite(policy.maxFailedCalls)
    ? policy.maxFailedCalls
    : 8;
  const requiredTools = Array.isArray(policy.requiredTools)
    ? policy.requiredTools.map(normalizeToolName).filter(Boolean)
    : [];

  if (record.totalCalls > maxCalls) {
    fail(
      `MCP guardrail: ${purpose} 단계 호출 수 초과 (${record.totalCalls} > ${maxCalls}).`
    );
  }

  if (record.failedCalls > maxFailedCalls) {
    fail(
      `MCP guardrail: ${purpose} 단계 실패 호출 초과 (${record.failedCalls} > ${maxFailedCalls}).`
    );
  }

  const totalCallsAcrossRun = Number(
    context?.agentMcpToolUsage?.totalCalls || 0
  );
  if (totalCallsAcrossRun > MAX_TOTAL_MCP_CALLS_PER_RUN) {
    fail(
      `MCP guardrail: 실행 전체 호출 수 초과 (${totalCallsAcrossRun} > ${MAX_TOTAL_MCP_CALLS_PER_RUN}).`
    );
  }

  const presentTools = summarizeToolPresence(record.calls || []);
  const missingRequiredTools = requiredTools.filter(
    (tool) => !presentTools.has(tool)
  );
  if (missingRequiredTools.length > 0) {
    fail(
      `MCP guardrail: ${purpose} 단계 필수 도구 호출 누락 (${missingRequiredTools.join(', ')}).`
    );
  }

  return {
    purpose,
    totalCalls: record.totalCalls,
    failedCalls: record.failedCalls,
    unavailableCalls: record.unavailableCalls,
    requiredToolsMissing: missingRequiredTools,
  };
}
