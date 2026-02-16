import { AGENT_COMMAND_MAP } from './constants.mjs';
import {
  hasAlias,
  hasCommand,
  runCommand,
  runShellCommand,
  shellEscape,
} from './command.mjs';
import { fail } from './errors.mjs';

export function resolveAgentRuntime(scenario) {
  const fallbackCommand = AGENT_COMMAND_MAP[scenario.engine];
  if (!fallbackCommand) {
    fail(`Unsupported agent.engine: ${scenario.engine}`);
  }

  const command = scenario.agent.command || fallbackCommand;
  const args = scenario.agent.args || [];

  if (hasCommand(command)) {
    return {
      command,
      args,
      mode: 'binary',
    };
  }

  if (hasAlias(command)) {
    return {
      command,
      args,
      mode: 'alias',
    };
  }

  fail(`Missing required command or alias: ${command}`);
}

export function runAgentCommand(agentRuntime, commandArgs, options = {}) {
  const allArgs = [...agentRuntime.args, ...commandArgs];

  if (agentRuntime.mode === 'binary') {
    return runCommand(agentRuntime.command, allArgs, options);
  }

  const commandLine = `${agentRuntime.command} ${allArgs
    .map((part) => shellEscape(part))
    .join(' ')}`.trim();
  return runShellCommand(commandLine, options);
}
