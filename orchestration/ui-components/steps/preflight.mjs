import { REQUIRED_BASE_COMMANDS } from '../lib/constants.mjs';
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

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
  };
}
