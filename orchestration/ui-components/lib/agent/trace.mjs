import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

function ensureAgentTraceDir(context) {
  const dirPath = resolve(context.artifactsDir, context.runId, 'agent-trace');
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function writeArtifact(filePath, content) {
  if (content === null || content === undefined) {
    return;
  }
  const serialized =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  writeFileSync(filePath, serialized, 'utf8');
}

function sanitizeImagePayloadEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return entry;
  }

  if (entry.type === 'image' && typeof entry.data === 'string') {
    return {
      ...entry,
      data: `[image payload omitted length=${entry.data.length}]`,
    };
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(entry)) {
    sanitized[key] = sanitizeImagePayloadEntry(value);
  }
  return sanitized;
}

function sanitizeJsonLine(line) {
  const raw = String(line ?? '');
  if (!raw.trim()) {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(sanitizeImagePayloadEntry(parsed));
  } catch {
    return raw;
  }
}

function sanitizeTraceStdout(stdout) {
  return String(stdout ?? '')
    .split(/\r?\n/)
    .map((line) => sanitizeJsonLine(line))
    .join('\n');
}

export function recordAgentTrace(context, trace) {
  const traceDir = ensureAgentTraceDir(context);
  const traceIndex = String(context.agentTraceArtifacts.length + 1).padStart(
    2,
    '0'
  );
  const safePurpose = trace.purpose.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
  const baseName = `${traceIndex}-${safePurpose}`;

  const metadataPath = resolve(traceDir, `${baseName}.meta.json`);
  const promptPath = resolve(traceDir, `${baseName}.prompt.md`);
  const stdoutPath = resolve(traceDir, `${baseName}.stdout.txt`);
  const stderrPath = resolve(traceDir, `${baseName}.stderr.txt`);
  const parsedPath = resolve(traceDir, `${baseName}.parsed.json`);

  writeArtifact(metadataPath, {
    purpose: trace.purpose,
    engine: context.scenario.engine,
    commandLine: trace.commandLine,
    timeoutMs: trace.timeoutMs,
    schema: trace.schema,
    status: trace.status,
    usage: trace.usage ?? null,
  });
  writeArtifact(promptPath, trace.prompt);
  writeArtifact(stdoutPath, sanitizeTraceStdout(trace.stdout));
  writeArtifact(stderrPath, trace.stderr ?? '');
  if (trace.parsed !== null && trace.parsed !== undefined) {
    writeArtifact(parsedPath, trace.parsed);
  }

  const record = {
    purpose: trace.purpose,
    status: trace.status,
    metadataPath: relative(context.rootPath, metadataPath),
    promptPath: relative(context.rootPath, promptPath),
    stdoutPath: relative(context.rootPath, stdoutPath),
    stderrPath: relative(context.rootPath, stderrPath),
    parsedPath:
      trace.parsed !== null && trace.parsed !== undefined
        ? relative(context.rootPath, parsedPath)
        : null,
    usage: trace.usage ?? null,
  };
  context.agentTraceArtifacts.push(record);
  return record;
}

function ensureAgentTokenUsage(context) {
  if (context.agentTokenUsage) {
    return context.agentTokenUsage;
  }
  context.agentTokenUsage = {
    records: [],
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    missingCount: 0,
  };
  return context.agentTokenUsage;
}

export function recordAgentTokenUsage(context, purpose, usage) {
  const summary = ensureAgentTokenUsage(context);
  const hasUsage =
    usage &&
    (usage.inputTokens !== null ||
      usage.outputTokens !== null ||
      usage.totalTokens !== null);

  if (!hasUsage) {
    summary.missingCount += 1;
    summary.records.push({
      purpose,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
    });
    return;
  }

  summary.totalInputTokens += usage.inputTokens ?? 0;
  summary.totalOutputTokens += usage.outputTokens ?? 0;
  summary.totalTokens += usage.totalTokens ?? 0;
  summary.records.push({
    purpose,
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
  });
}

function ensureAgentMcpToolUsage(context) {
  if (context.agentMcpToolUsage) {
    return context.agentMcpToolUsage;
  }
  context.agentMcpToolUsage = {
    records: [],
    totalCalls: 0,
    successCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
  };
  return context.agentMcpToolUsage;
}

function normalizeMcpOutcome(status) {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  if (
    normalized === 'ok' ||
    normalized === 'partial' ||
    normalized === 'no_mapping'
  ) {
    return 'success';
  }
  if (normalized === 'unavailable') {
    return 'unavailable';
  }
  return 'failed';
}

export function recordAgentMcpToolUsage(context, purpose, calls) {
  const summary = ensureAgentMcpToolUsage(context);
  const normalizedCalls = Array.isArray(calls)
    ? calls
        .map((call) => ({
          purpose,
          server: String(call?.server || '').trim(),
          tool: String(call?.tool || '').trim(),
          status: String(call?.status || '')
            .trim()
            .toLowerCase(),
          rawStatus: String(call?.rawStatus || '')
            .trim()
            .toLowerCase(),
          nodeId: String(call?.nodeId || '').trim(),
          error: String(call?.error || '').trim(),
          output: String(call?.output || ''),
        }))
        .filter((call) => Boolean(call.tool))
    : [];

  const record = {
    purpose,
    totalCalls: normalizedCalls.length,
    successCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
    callsByTool: {},
    calls: normalizedCalls,
  };

  for (const call of normalizedCalls) {
    if (!record.callsByTool[call.tool]) {
      record.callsByTool[call.tool] = {
        calls: 0,
        successCalls: 0,
        failedCalls: 0,
        unavailableCalls: 0,
        statuses: {},
      };
    }

    const toolSummary = record.callsByTool[call.tool];
    toolSummary.calls += 1;
    toolSummary.statuses[call.status] =
      (toolSummary.statuses[call.status] ?? 0) + 1;

    const outcome = normalizeMcpOutcome(call.status);
    if (outcome === 'success') {
      record.successCalls += 1;
      toolSummary.successCalls += 1;
      continue;
    }
    if (outcome === 'unavailable') {
      record.unavailableCalls += 1;
      toolSummary.unavailableCalls += 1;
      continue;
    }
    record.failedCalls += 1;
    toolSummary.failedCalls += 1;
  }

  summary.totalCalls += record.totalCalls;
  summary.successCalls += record.successCalls;
  summary.failedCalls += record.failedCalls;
  summary.unavailableCalls += record.unavailableCalls;
  summary.records.push(record);
}

export function getLatestAgentMcpUsageRecord(context, purpose) {
  const records = context?.agentMcpToolUsage?.records;
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }

  for (let i = records.length - 1; i >= 0; i -= 1) {
    const record = records[i];
    if (!purpose || record.purpose === purpose) {
      return record;
    }
  }

  return null;
}
