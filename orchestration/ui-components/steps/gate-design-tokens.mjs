import { fail } from '../lib/errors.mjs';
import { FIGMA_REQUIRED_TOOLS } from '../lib/mcp-guardrails.mjs';

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.designTokensMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
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
    };
    return context.designTokensGate;
  }

  const toolRecords = Object.values(capture.tools || {}).filter(
    (record) => record && typeof record === 'object'
  );
  const toolByName = new Map(
    toolRecords.map((record) => [String(record.tool || '').trim(), record])
  );
  const missingTools = FIGMA_REQUIRED_TOOLS.filter(
    (toolName) => !toolByName.has(toolName)
  );
  const badTools = FIGMA_REQUIRED_TOOLS.map((toolName) => ({
    tool: toolName,
    record: toolByName.get(toolName),
  }))
    .filter((item) => item.record)
    .filter(({ record }) => String(record.status || '').toLowerCase() !== 'ok')
    .map(({ tool, record }) => ({
      tool,
      status: String(record.status || ''),
      error: String(record.error || ''),
    }));

  if (missingTools.length > 0) {
    gateFailureOrWarning(
      context,
      `필수 Figma MCP 도구 커버리지가 부족합니다: ${missingTools.join(', ')}`
    );
  }

  if (badTools.length > 0) {
    gateFailureOrWarning(
      context,
      `필수 Figma MCP 도구 상태가 비정상입니다: ${badTools
        .map(
          (item) =>
            `${item.tool}(${item.status}${item.error ? `: ${item.error}` : ''})`
        )
        .join(', ')}`
    );
  }

  if (capture.status === 'invalid') {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처 상태가 invalid입니다 (스키마/파싱 이슈).'
    );
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
    totalTokens: capture.stats?.totalTokens ?? 0,
    coreCoverage: capture.stats?.coreCoverage ?? 0,
  };

  return context.designTokensGate;
}
