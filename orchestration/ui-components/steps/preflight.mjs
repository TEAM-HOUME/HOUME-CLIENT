import { REQUIRED_BASE_COMMANDS } from '../lib/constants.mjs';
import {
  hasCommand,
  runAgentCommand,
  resolveAgentRuntime,
} from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';
import {
  classifyJsonRpcCall,
  initializeFigmaMcpSession,
  listFigmaMcpTools,
} from '../lib/figma-mcp-direct.mjs';

const REQUIRED_FIGMA_TOOLS = [
  'get_design_context',
  'get_variable_defs',
  'get_metadata',
  'get_screenshot',
];

function probeFigmaMcp(context) {
  const endpoint = context.scenario.figma.mcpEndpoint;
  const timeoutMs = Math.min(context.scenario.figma.timeoutMs, 15_000);

  const session = initializeFigmaMcpSession({
    endpoint,
    timeoutMs,
  });
  if (!session.ok) {
    fail(
      `Figma MCP 초기화 점검에 실패했습니다. endpoint=${endpoint}, 원인=${session.initializeState.error}.`
    );
  }

  const toolsListCall = listFigmaMcpTools({
    endpoint,
    sessionId: session.sessionId,
    timeoutMs,
    requestId: 11,
  });
  const toolsListState = classifyJsonRpcCall(toolsListCall);
  if (toolsListState.status !== 'ok') {
    fail(
      `Figma MCP tools/list 점검에 실패했습니다. endpoint=${endpoint}, 원인=${toolsListState.error}.`
    );
  }

  const availableTools = Array.isArray(
    toolsListCall.response.parsedJsonRpc?.result?.tools
  )
    ? toolsListCall.response.parsedJsonRpc.result.tools
        .map((tool) => String(tool?.name || '').trim())
        .filter(Boolean)
    : [];
  const missingTools = REQUIRED_FIGMA_TOOLS.filter(
    (tool) => !availableTools.includes(tool)
  );
  const satisfiedRequiredToolCount =
    REQUIRED_FIGMA_TOOLS.length - missingTools.length;
  if (missingTools.length > 0) {
    fail(
      `Figma MCP 필수 도구가 누락되었습니다. endpoint=${endpoint}, 누락=${missingTools.join(', ')}`
    );
  }

  return {
    endpoint,
    availableToolCount: availableTools.length,
    requiredToolCount: REQUIRED_FIGMA_TOOLS.length,
    satisfiedRequiredToolCount,
  };
}

export function stepPreflight(context) {
  const requiredCommands = [...REQUIRED_BASE_COMMANDS];
  const missing = requiredCommands.filter((command) => !hasCommand(command));
  if (missing.length > 0) {
    fail(`필수 명령어가 없습니다: ${missing.join(', ')}`);
  }

  context.agentRuntime = resolveAgentRuntime(context.scenario);
  runAgentCommand(context.agentRuntime, ['--version'], {
    timeoutMs: 10_000,
  });
  const mcpProbe = probeFigmaMcp(context);

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
    mcpEndpoint: mcpProbe.endpoint,
    mcpTools: `${mcpProbe.requiredToolCount}/${mcpProbe.availableToolCount}`,
    mcpRequiredToolCount: mcpProbe.requiredToolCount,
    mcpSatisfiedRequiredToolCount: mcpProbe.satisfiedRequiredToolCount,
    mcpAvailableToolCount: mcpProbe.availableToolCount,
  };
}
