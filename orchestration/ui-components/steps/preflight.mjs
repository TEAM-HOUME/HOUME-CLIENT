import {
  FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES,
  FIGMA_MCP_SERVER_CANDIDATES,
  REQUIRED_BASE_COMMANDS,
  CODEX_SAFE_CONFIG,
} from '../lib/constants.mjs';
import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  initializeFigmaMcpSession,
  listFigmaMcpTools,
} from '../lib/figma-mcp-direct.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';
import { parseFigmaUrl } from '../lib/figma.mjs';
import {
  hasCommand,
  runAgentCommand,
  resolveAgentRuntime,
} from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';

const REQUIRED_FIGMA_MCP_TOOLS = [
  'get_design_context',
  'get_variable_defs',
  'get_metadata',
  'get_screenshot',
];

function appendAuthHint(message, endpoint, authEnvName) {
  const lowered = String(message ?? '').toLowerCase();
  if (!lowered.includes('http 401') && !lowered.includes('http 403')) {
    return message;
  }

  const envHint = authEnvName || FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES[0];
  return `${message}. Remote MCP auth required. Export ${envHint}=<token> for endpoint ${endpoint}.`;
}

function hasConfiguredFigmaMcpServer(context) {
  return FIGMA_MCP_SERVER_CANDIDATES.some((serverName) => {
    if (context.scenario.engine === 'codex') {
      const result = runAgentCommand(
        context.agentRuntime,
        [...CODEX_SAFE_CONFIG, 'mcp', 'get', serverName],
        {
          timeoutMs: 10_000,
          allowFailure: true,
        }
      );
      return result.exitCode === 0;
    }

    const result = runAgentCommand(
      context.agentRuntime,
      ['mcp', 'get', serverName],
      {
        timeoutMs: 10_000,
        allowFailure: true,
      }
    );
    return result.exitCode === 0;
  });
}

function runFigmaMcpLiveProbe(context) {
  const endpoint = context.scenario.figma.mcpEndpoint;
  const figmaMeta = parseFigmaUrl(context.scenario.figma.url);
  const timeoutMs = Math.min(context.scenario.figma.timeoutMs, 60_000);
  const auth = resolveFigmaMcpAuth(context.scenario);

  const session = initializeFigmaMcpSession({
    endpoint,
    timeoutMs,
    authToken: auth.token,
  });
  if (!session.ok) {
    const reason = appendAuthHint(
      session.initializeState.error || 'unknown initialize error',
      endpoint,
      auth.envName
    );
    fail(`Figma MCP initialize probe failed at ${endpoint}: ${reason}`);
  }

  const toolsListCall = listFigmaMcpTools({
    endpoint,
    sessionId: session.sessionId,
    authToken: auth.token,
    timeoutMs,
    requestId: 2,
  });
  const toolsListState = classifyJsonRpcCall(toolsListCall);
  if (toolsListState.status !== 'ok') {
    const reason = appendAuthHint(
      toolsListState.error || 'unknown tools/list error',
      endpoint,
      auth.envName
    );
    fail(`Figma MCP tools/list probe failed at ${endpoint}: ${reason}`);
  }

  const availableTools = Array.isArray(
    toolsListCall.response.parsedJsonRpc?.result?.tools
  )
    ? toolsListCall.response.parsedJsonRpc.result.tools
        .map((tool) => tool?.name)
        .filter(Boolean)
    : [];

  const missingTools = REQUIRED_FIGMA_MCP_TOOLS.filter(
    (toolName) => !availableTools.includes(toolName)
  );
  if (missingTools.length > 0) {
    fail(
      `Figma MCP required tool(s) missing: ${missingTools.join(', ')} (endpoint: ${endpoint})`
    );
  }

  const probeCall = callFigmaMcpTool({
    endpoint,
    sessionId: session.sessionId,
    authToken: auth.token,
    timeoutMs,
    requestId: 3,
    toolName: 'get_metadata',
    toolArguments: {
      nodeId: figmaMeta.nodeIdNormalized,
      clientLanguages: 'typescript',
      clientFrameworks: 'react',
    },
  });
  const probeState = classifyJsonRpcCall(probeCall);
  if (probeState.status !== 'ok') {
    const reason = appendAuthHint(
      probeState.error || 'unknown probe error',
      endpoint,
      auth.envName
    );
    fail(
      `Figma MCP probe call failed (get_metadata:${figmaMeta.nodeIdNormalized}) at ${endpoint}: ${reason}`
    );
  }

  return {
    endpoint,
    nodeId: figmaMeta.nodeIdNormalized,
    timeoutMs,
    probeTool: 'get_metadata',
    availableToolCount: availableTools.length,
    authTokenEnv: auth.envName || '(none)',
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

  let mcpProbe = null;
  if (!context.options.skipMcpCheck) {
    const mcpConfigured = hasConfiguredFigmaMcpServer(context);

    if (!mcpConfigured) {
      fail(
        `Figma MCP server was not found. Expected one of: ${FIGMA_MCP_SERVER_CANDIDATES.join(', ')}`
      );
    }

    mcpProbe = runFigmaMcpLiveProbe(context);
  }

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
    skipMcpCheck: context.options.skipMcpCheck,
    mcpProbe,
  };
}
