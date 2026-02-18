import { buildImagePayloadRedaction } from './image-payload-sanitizer.mjs';

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

function toFiniteNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }
  return number;
}

function normalizeUsageObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const inputTokens =
    toFiniteNumber(value.input_tokens) ??
    toFiniteNumber(value.prompt_tokens) ??
    toFiniteNumber(value.inputTokens) ??
    toFiniteNumber(value.promptTokens);

  const outputTokens =
    toFiniteNumber(value.output_tokens) ??
    toFiniteNumber(value.completion_tokens) ??
    toFiniteNumber(value.outputTokens) ??
    toFiniteNumber(value.completionTokens);

  let totalTokens =
    toFiniteNumber(value.total_tokens) ?? toFiniteNumber(value.totalTokens);
  if (totalTokens === null && (inputTokens !== null || outputTokens !== null)) {
    totalTokens = (inputTokens ?? 0) + (outputTokens ?? 0);
  }

  if (inputTokens === null && outputTokens === null && totalTokens === null) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function extractUsageFromValue(value, depth = 0) {
  if (!value || depth > 5) {
    return null;
  }

  const directUsage = normalizeUsageObject(value);
  if (directUsage) {
    return directUsage;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const usage = extractUsageFromValue(item, depth + 1);
      if (usage) {
        return usage;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    const usageKeyCandidates = [
      'usage',
      'token_usage',
      'tokenUsage',
      'metrics',
    ];
    for (const key of usageKeyCandidates) {
      if (!(key in value)) {
        continue;
      }
      const usage = extractUsageFromValue(value[key], depth + 1);
      if (usage) {
        return usage;
      }
    }

    for (const nestedValue of Object.values(value)) {
      if (!nestedValue || typeof nestedValue !== 'object') {
        continue;
      }
      const usage = extractUsageFromValue(nestedValue, depth + 1);
      if (usage) {
        return usage;
      }
    }
  }

  return null;
}

function parseAgentOutput(text) {
  const envelope = extractFirstJson(text);
  if (!envelope) {
    return {
      parsed: null,
      usage: null,
      envelope: null,
      mcpToolCalls: [],
    };
  }

  let parsed = envelope;
  if (
    envelope &&
    typeof envelope === 'object' &&
    !Array.isArray(envelope) &&
    'result' in envelope
  ) {
    const resultValue = envelope.result;
    if (typeof resultValue === 'string') {
      parsed = extractFirstJson(resultValue);
    } else if (
      resultValue &&
      typeof resultValue === 'object' &&
      !Array.isArray(resultValue)
    ) {
      parsed = resultValue;
    } else {
      parsed = null;
    }
  }

  const usage = extractUsageFromValue(envelope);
  return {
    parsed,
    usage,
    envelope,
    mcpToolCalls: [],
  };
}

function parseJsonLinesEvents(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const events = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Non-JSON line
    }
  }

  return events;
}

function extractMcpToolOutput(item) {
  if (!item || typeof item !== 'object') {
    return '';
  }

  const result = item.result;
  if (!result || typeof result !== 'object') {
    return '';
  }

  const content = Array.isArray(result.content) ? result.content : [];
  const chunks = [];

  for (const entry of content) {
    if (entry?.type === 'text' && typeof entry.text === 'string') {
      chunks.push(entry.text);
      continue;
    }

    if (entry?.type === 'image') {
      chunks.push(
        buildImagePayloadRedaction({
          mimeType: entry?.mimeType,
          length: String(entry?.data || '').length,
        })
      );
    }
  }

  if (chunks.length > 0) {
    return chunks.join('\n');
  }

  return JSON.stringify(result, null, 2);
}

function normalizeMcpCallStatus(item) {
  const rawStatus = String(item?.status ?? '')
    .trim()
    .toLowerCase();

  if (rawStatus === 'in_progress') {
    return 'in_progress';
  }

  if (rawStatus === 'completed') {
    if (item?.error || item?.result?.isError === true) {
      return 'failed';
    }
    return 'ok';
  }

  if (rawStatus === 'failed') {
    return 'failed';
  }

  if (rawStatus === 'cancelled') {
    return 'unavailable';
  }

  return rawStatus || 'failed';
}

function extractMcpToolCallsFromEvents(events) {
  const calls = [];

  for (const event of events) {
    const item = event?.item;
    if (!item || item.type !== 'mcp_tool_call') {
      continue;
    }

    if (event?.type !== 'item.completed') {
      continue;
    }

    const normalizedStatus = normalizeMcpCallStatus(item);
    if (normalizedStatus === 'in_progress') {
      continue;
    }

    calls.push({
      server: String(item.server || '').trim(),
      tool: String(item.tool || '').trim(),
      status: normalizedStatus,
      rawStatus: String(item.status || '')
        .trim()
        .toLowerCase(),
      nodeId:
        item?.arguments && typeof item.arguments === 'object'
          ? String(item.arguments.nodeId || '').trim()
          : '',
      error: String(item.error || '').trim(),
      output: extractMcpToolOutput(item),
    });
  }

  return calls;
}

function extractAgentMessageText(item) {
  if (!item || typeof item !== 'object') {
    return '';
  }

  if (typeof item.text === 'string' && item.text.trim()) {
    return item.text;
  }

  if (!Array.isArray(item.content)) {
    return '';
  }

  const textParts = item.content
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (!entry || typeof entry !== 'object') {
        return '';
      }
      if (typeof entry.text === 'string') {
        return entry.text;
      }
      if (typeof entry.content === 'string') {
        return entry.content;
      }
      return '';
    })
    .filter(Boolean);

  return textParts.join('\n');
}

export function parseCodexJsonOutput(text) {
  const events = parseJsonLinesEvents(text);
  if (events.length === 0) {
    return parseAgentOutput(text);
  }

  let usage = null;
  let parsed = null;
  let envelope = events[events.length - 1] ?? null;

  const mcpToolCalls = extractMcpToolCallsFromEvents(events);

  for (const event of events) {
    const eventUsage = extractUsageFromValue(event);
    if (eventUsage) {
      usage = eventUsage;
    }
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const item = event?.item;
    if (!item || item.type !== 'agent_message') {
      continue;
    }

    const messageText = extractAgentMessageText(item);
    if (!messageText) {
      continue;
    }

    const candidate = extractFirstJson(messageText);
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate)
    ) {
      continue;
    }

    parsed = candidate;
    envelope = event;
    break;
  }

  if (!parsed) {
    const fallback = parseAgentOutput(text);
    return {
      parsed: fallback.parsed,
      usage: usage ?? fallback.usage,
      envelope: fallback.envelope ?? envelope,
      mcpToolCalls:
        mcpToolCalls.length > 0 ? mcpToolCalls : fallback.mcpToolCalls || [],
    };
  }

  return {
    parsed,
    usage,
    envelope,
    mcpToolCalls,
  };
}

export function parseAgentJsonOutput(text) {
  const output = parseAgentOutput(text);
  if (!output.parsed) {
    return null;
  }

  if (typeof output.parsed !== 'object' || Array.isArray(output.parsed)) {
    return null;
  }

  return output.parsed;
}
