import {
  FIGMA_MCP_SERVER_CANDIDATES,
  REQUIRED_BASE_COMMANDS,
  CODEX_SAFE_CONFIG,
} from '../lib/constants.mjs';
import {
  hasCommand,
  runAgentCommand,
  resolveAgentRuntime,
} from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';

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

  if (!context.options.skipMcpCheck) {
    const mcpConfigured = FIGMA_MCP_SERVER_CANDIDATES.some((serverName) => {
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

    if (!mcpConfigured) {
      fail(
        `Figma MCP server was not found. Expected one of: ${FIGMA_MCP_SERVER_CANDIDATES.join(', ')}`
      );
    }
  }

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
    skipMcpCheck: context.options.skipMcpCheck,
  };
}
