import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CODEX_SAFE_CONFIG } from './constants.mjs';
import { fail } from './errors.mjs';
import { resolveAgentTimeoutMs } from './timeout-budget.mjs';
import {
  hasAlias,
  hasCommand,
  resolveAgentRuntime,
  runAgentCommand,
  runCommand,
} from './agent/command-runtime.mjs';
import {
  parseAgentJsonOutput,
  parseCodexJsonOutput,
} from './agent/output-parser.mjs';
import {
  getLatestAgentMcpUsageRecord,
  recordAgentMcpToolUsage,
  recordAgentTokenUsage,
  recordAgentTrace,
} from './agent/trace.mjs';

export {
  getLatestAgentMcpUsageRecord,
  hasAlias,
  hasCommand,
  parseAgentJsonOutput,
  resolveAgentRuntime,
  runAgentCommand,
  runCommand,
};

export function invokeAgentWithSchema(
  context,
  purpose,
  prompt,
  schema,
  timeoutMs
) {
  if (context.scenario.engine === 'codex') {
    const effectiveTimeoutMs = resolveAgentTimeoutMs(
      context,
      purpose,
      timeoutMs
    );
    const schemaPath = resolve(
      context.artifactsDir,
      `${context.runId}-${purpose}-schema.json`
    );
    writeFileSync(schemaPath, JSON.stringify(schema), 'utf8');

    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-a',
        'never',
        ...CODEX_SAFE_CONFIG,
        'exec',
        '-C',
        context.rootPath,
        '--json',
        '--output-schema',
        schemaPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs: effectiveTimeoutMs,
      }
    );

    const parsedOutput = parseCodexJsonOutput(result.stdout);
    const parsed = parsedOutput.parsed;
    recordAgentTrace(context, {
      purpose,
      commandLine: result.commandLine,
      timeoutMs: effectiveTimeoutMs,
      prompt,
      schema,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
      usage: parsedOutput.usage,
      status: parsed ? 'parsed' : 'parse_failed',
    });
    recordAgentTokenUsage(context, purpose, parsedOutput.usage);
    recordAgentMcpToolUsage(context, purpose, parsedOutput.mcpToolCalls);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail(
        `Unable to parse JSON output from codex (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  fail(`Unsupported engine for agent invocation: ${context.scenario.engine}`);
}
