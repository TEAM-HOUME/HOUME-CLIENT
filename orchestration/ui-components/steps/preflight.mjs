import {
  CODEX_SAFE_CONFIG,
  REQUIRED_BASE_COMMANDS,
} from '../lib/constants.mjs';
import {
  hasCommand,
  runAgentCommand,
  resolveAgentRuntime,
} from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';

function resolveCodexRuntimeInfo() {
  const modelIndex = CODEX_SAFE_CONFIG.indexOf('-m');
  const model =
    modelIndex >= 0
      ? String(CODEX_SAFE_CONFIG[modelIndex + 1] || '').trim()
      : '';

  let reasoningEffort = '';
  const configIndex = CODEX_SAFE_CONFIG.indexOf('-c');
  if (configIndex >= 0) {
    const rawConfig = String(CODEX_SAFE_CONFIG[configIndex + 1] || '').trim();
    const matched = rawConfig.match(
      /model_reasoning_effort\s*=\s*"?([a-zA-Z_]+)"?/
    );
    reasoningEffort = matched ? matched[1] : '';
  }

  return {
    model: model || 'unknown',
    reasoningEffort: reasoningEffort || 'unknown',
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
  const runtimeInfo = resolveCodexRuntimeInfo();

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
    model: runtimeInfo.model,
    reasoningEffort: runtimeInfo.reasoningEffort,
  };
}
