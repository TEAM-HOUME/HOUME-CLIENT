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
  writeArtifact(stdoutPath, trace.stdout ?? '');
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
