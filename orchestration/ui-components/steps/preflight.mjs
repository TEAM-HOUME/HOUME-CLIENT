import { REQUIRED_BASE_COMMANDS } from '../lib/constants.mjs';
import {
  hasCommand,
  runAgentCommand,
  resolveAgentRuntime,
} from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';
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
  const auth = resolveFigmaMcpAuth(context.scenario);

  const session = initializeFigmaMcpSession({
    endpoint,
    timeoutMs,
    authToken: auth.token,
  });
  if (!session.ok) {
    fail(
      `Figma MCP initialize probe failed at ${endpoint}: ${session.initializeState.error}.`
    );
  }

  const toolsListCall = listFigmaMcpTools({
    endpoint,
    sessionId: session.sessionId,
    authToken: auth.token,
    timeoutMs,
    requestId: 11,
  });
  const toolsListState = classifyJsonRpcCall(toolsListCall);
  if (toolsListState.status !== 'ok') {
    fail(
      `Figma MCP tools/list probe failed at ${endpoint}: ${toolsListState.error}.`
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
  if (missingTools.length > 0) {
    fail(
      `Figma MCP required tools are missing at ${endpoint}: ${missingTools.join(', ')}`
    );
  }

  return {
    endpoint,
    availableToolCount: availableTools.length,
    requiredToolCount: REQUIRED_FIGMA_TOOLS.length,
  };
}

export function stepPreflight(context) {
  const requiredCommands = [...REQUIRED_BASE_COMMANDS];
  const missing = requiredCommands.filter((command) => !hasCommand(command));
  if (missing.length > 0) {
    fail(`Missing required command(s): ${missing.join(', ')}`);
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
  };
}
