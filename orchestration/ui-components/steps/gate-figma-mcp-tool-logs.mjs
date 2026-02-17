import { fail } from '../lib/errors.mjs';

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.figmaMcpLogsMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

export function stepGateFigmaMcpToolLogs(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.figmaMcpLogsMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.figma_mcp_logs_mode` is off',
    };
  }

  const logs = context.figmaMcpToolLogs;
  if (!logs) {
    gateFailureOrWarning(context, 'Figma MCP 원본 도구 로그가 없습니다.');
    context.figmaMcpToolLogsGate = {
      mode: context.scenario.gates.figmaMcpLogsMode,
      status: 'missing',
      missingTools: [],
      badTools: [],
    };
    return context.figmaMcpToolLogsGate;
  }

  const requiredTools = Array.isArray(logs.requiredTools)
    ? logs.requiredTools
    : [];
  const calls = Array.isArray(logs.calls) ? logs.calls : [];
  const callMap = new Map(calls.map((call) => [call.tool, call]));

  const missingTools = requiredTools.filter(
    (toolName) => !callMap.has(toolName)
  );
  if (missingTools.length > 0) {
    gateFailureOrWarning(
      context,
      `필수 Figma MCP 도구 호출이 누락되었습니다: ${missingTools.join(', ')}`
    );
  }

  const badTools = requiredTools
    .map((toolName) => callMap.get(toolName))
    .filter(Boolean)
    .filter((call) => call.status !== 'ok')
    .map((call) => ({
      tool: call.tool,
      status: call.status,
      error: call.error || '',
    }));

  if (badTools.length > 0) {
    const detail = badTools
      .map(
        (item) =>
          `${item.tool}(${item.status}${item.error ? `: ${item.error}` : ''})`
      )
      .join(', ');
    gateFailureOrWarning(
      context,
      `Figma MCP 도구 호출이 품질 게이트를 통과하지 못했습니다: ${detail}`
    );
  }

  context.figmaMcpToolLogsGate = {
    mode: context.scenario.gates.figmaMcpLogsMode,
    status:
      badTools.length === 0 && missingTools.length === 0 ? 'ok' : 'degraded',
    checkedTools: requiredTools.length,
    missingTools,
    badTools,
  };

  return context.figmaMcpToolLogsGate;
}
