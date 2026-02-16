import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

import { CODEX_SAFE_CONFIG } from './constants.mjs';
import { fail } from './errors.mjs';
import { runAgentCommand } from './agent-runtime.mjs';

function extractFirstJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fallback scan
  }

  const start = trimmed.indexOf('{');
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      const candidate = trimmed.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function parseAgentJsonOutput(text) {
  const parsed = extractFirstJson(text);
  if (!parsed) {
    return null;
  }

  if (typeof parsed.result === 'string') {
    const nested = extractFirstJson(parsed.result);
    if (nested) {
      return nested;
    }
  }

  return parsed;
}

export function invokeAgentWithSchema(
  context,
  purpose,
  prompt,
  schema,
  timeoutMs
) {
  if (context.scenario.engine === 'codex') {
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
        '--output-schema',
        schemaPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    if (!parsed) {
      fail(
        `Unable to parse JSON output from codex (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  if (context.scenario.engine === 'claude') {
    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-p',
        '--output-format',
        'json',
        '--json-schema',
        JSON.stringify(schema),
        '--permission-mode',
        'plan',
        '--add-dir',
        context.rootPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    if (!parsed) {
      fail(
        `Unable to parse JSON output from claude (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  fail(`Unsupported engine for agent invocation: ${context.scenario.engine}`);
}
