import { fail } from '../lib/errors.mjs';
import { getLatestAgentMcpUsageRecord } from '../lib/agent.mjs';
import { FIGMA_REQUIRED_TOOLS } from '../lib/mcp-guardrails.mjs';

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.designTokensMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeError(value) {
  return String(value || '').trim();
}

function buildCaptureToolMap(capture) {
  const map = new Map();
  const toolRecords = Object.values(capture?.tools || {}).filter(
    (record) => record && typeof record === 'object'
  );
  for (const record of toolRecords) {
    const tool = String(record.tool || '').trim();
    if (!tool) {
      continue;
    }
    map.set(tool, {
      tool,
      status: normalizeStatus(record.status),
      error: normalizeError(record.error),
      source: 'capture',
    });
  }
  return map;
}

function resolveToolStateFromUsage(usageRecord, toolName) {
  const calls = Array.isArray(usageRecord?.calls)
    ? usageRecord.calls.filter(
        (call) => String(call?.tool || '').trim() === toolName
      )
    : [];
  if (calls.length === 0) {
    return null;
  }

  const hasOk = calls.some((call) => normalizeStatus(call?.status) === 'ok');
  if (hasOk) {
    return {
      tool: toolName,
      status: 'ok',
      error: '',
      source: 'mcp_usage',
    };
  }

  const latestErroredCall = [...calls]
    .reverse()
    .find((call) => normalizeError(call?.error));
  const latestError = latestErroredCall
    ? normalizeError(latestErroredCall.error)
    : '';
  const hasUnavailable = calls.some(
    (call) => normalizeStatus(call?.status) === 'unavailable'
  );

  return {
    tool: toolName,
    status: hasUnavailable ? 'unavailable' : 'failed',
    error: latestError,
    source: 'mcp_usage',
  };
}

function buildRequiredToolStates(context, capture) {
  const usageRecord = getLatestAgentMcpUsageRecord(context, 'design-tokens');
  const captureTools = buildCaptureToolMap(capture);

  return FIGMA_REQUIRED_TOOLS.map((toolName) => {
    const fromUsage = resolveToolStateFromUsage(usageRecord, toolName);
    if (fromUsage) {
      return fromUsage;
    }
    return captureTools.get(toolName) || null;
  });
}

export function stepGateDesignTokens(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.designTokensMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.design_tokens_mode` is off',
    };
  }

  const capture = context.designTokens;
  if (!capture) {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처 결과가 컨텍스트에 없습니다.'
    );
    context.designTokensGate = {
      mode: context.scenario.gates.designTokensMode,
      status: 'missing',
      totalTokens: 0,
      coreCoverage: 0,
      requiredTools: FIGMA_REQUIRED_TOOLS.length,
      coveredTools: 0,
      missingTools: [...FIGMA_REQUIRED_TOOLS],
      badTools: [],
      toolEvidenceSource: 'none',
    };
    return context.designTokensGate;
  }

  const toolStates = buildRequiredToolStates(context, capture);
  const missingTools = FIGMA_REQUIRED_TOOLS.filter(
    (_, index) => !toolStates[index]
  );
  const badTools = toolStates
    .filter(Boolean)
    .filter((state) => normalizeStatus(state.status) !== 'ok')
    .map((state) => ({
      tool: state.tool,
      status: normalizeStatus(state.status),
      error: normalizeError(state.error),
      source: state.source || 'unknown',
    }));

  const toolEvidenceSource = toolStates.some(
    (state) => state && state.source === 'mcp_usage'
  )
    ? 'mcp_usage'
    : 'capture';

  if (missingTools.length > 0) {
    gateFailureOrWarning(
      context,
      `필수 Figma MCP 도구 커버리지가 부족합니다: ${missingTools.join(', ')} (근거=${toolEvidenceSource})`
    );
  }

  if (badTools.length > 0) {
    gateFailureOrWarning(
      context,
      `필수 Figma MCP 도구 상태가 비정상입니다: ${badTools
        .map(
          (item) =>
            `${item.tool}(${item.status}${item.error ? `: ${item.error}` : ''}${item.source ? `, source=${item.source}` : ''})`
        )
        .join(', ')}`
    );
  }

  if (capture.status === 'invalid') {
    const hasDiagnosticsErrors =
      Array.isArray(capture.diagnostics?.errors) &&
      capture.diagnostics.errors.length > 0;
    const hasInsufficientTokenCoverage =
      Number(capture.stats?.totalTokens || 0) <= 0 ||
      Number(capture.stats?.coreCoverage || 0) < 2;
    const hasToolProblems = missingTools.length > 0 || badTools.length > 0;

    if (
      hasDiagnosticsErrors ||
      hasInsufficientTokenCoverage ||
      hasToolProblems
    ) {
      gateFailureOrWarning(
        context,
        '디자인 토큰 캡처 상태가 invalid입니다 (품질/도구/파싱 이슈).'
      );
    } else {
      context.warnings.push(
        '디자인 토큰 캡처 status=invalid가 감지됐지만, MCP 호출 기준 필수 도구와 토큰 커버리지는 정상으로 확인되어 진행합니다.'
      );
    }
  } else if (capture.status === 'unavailable') {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처를 사용할 수 없습니다 (MCP/도구 실패).'
    );
  } else if (capture.status === 'partial') {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처 상태가 partial입니다 (코어 토큰 커버리지 부족).'
    );
  }

  context.designTokensGate = {
    mode: context.scenario.gates.designTokensMode,
    status: capture.status,
    requiredTools: FIGMA_REQUIRED_TOOLS.length,
    coveredTools:
      FIGMA_REQUIRED_TOOLS.length - missingTools.length - badTools.length,
    missingTools,
    badTools,
    toolEvidenceSource,
    totalTokens: capture.stats?.totalTokens ?? 0,
    coreCoverage: capture.stats?.coreCoverage ?? 0,
  };

  return context.designTokensGate;
}
