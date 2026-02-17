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
    gateFailureOrWarning(context, 'Figma MCP raw tool logs are missing.');
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
      `Missing required Figma MCP tool calls: ${missingTools.join(', ')}`
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
      `Figma MCP tool calls did not pass quality gate: ${detail}`
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
