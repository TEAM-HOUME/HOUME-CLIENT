import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCommand } from './agent.mjs';

const DEFAULT_ACCEPT_HEADER = 'application/json, text/event-stream';

function parseHeaderBlocks(rawHeaders) {
  const blocks = [];
  const sections = String(rawHeaders ?? '')
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const section of sections) {
    if (!section.startsWith('HTTP/')) {
      continue;
    }
    blocks.push(section);
  }
  return blocks;
}

function parseHeaders(rawHeaders) {
  const blocks = parseHeaderBlocks(rawHeaders);
  const selected = blocks.at(-1) || '';
  const lines = selected.split(/\r?\n/).filter(Boolean);
  const statusLine = lines[0] || '';
  const statusMatch = statusLine.match(/^HTTP\/\S+\s+(\d+)/);
  const statusCode = statusMatch ? Number(statusMatch[1]) : null;
  const headers = {};

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const separatorIndex = line.indexOf(':');
    if (separatorIndex <= 0) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    headers[key] = value;
  }

  return {
    raw: selected,
    statusLine,
    statusCode,
    headers,
  };
}

function parseSseJsonMessages(bodyRaw) {
  const lines = String(bodyRaw ?? '').split(/\r?\n/);
  const messages = [];
  let dataLines = [];

  function flushDataLines() {
    if (dataLines.length === 0) {
      return;
    }

    const joined = dataLines.join('\n').trim();
    dataLines = [];
    if (!joined || joined === '[DONE]') {
      return;
    }

    try {
      messages.push(JSON.parse(joined));
    } catch {
      messages.push({
        parseError: true,
        raw: joined,
      });
    }
  }

  for (const line of lines) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
      continue;
    }

    if (!line.trim()) {
      flushDataLines();
    }
  }

  flushDataLines();
  return messages;
}

function parseJsonRpcBody(bodyRaw, contentType) {
  const normalizedType = String(contentType ?? '').toLowerCase();
  if (normalizedType.includes('text/event-stream')) {
    const messages = parseSseJsonMessages(bodyRaw);
    const jsonMessage = [...messages]
      .reverse()
      .find((item) => item && typeof item === 'object' && item.jsonrpc);
    return {
      parsed: jsonMessage || null,
      sseMessages: messages,
    };
  }

  try {
    return {
      parsed: JSON.parse(String(bodyRaw ?? '')),
      sseMessages: [],
    };
  } catch {
    return {
      parsed: null,
      sseMessages: [],
    };
  }
}

function sendJsonRpcRequest({
  endpoint,
  sessionId,
  authToken,
  payload,
  timeoutMs,
  acceptHeader = DEFAULT_ACCEPT_HEADER,
}) {
  const tempDir = mkdtempSync(join(tmpdir(), 'ui-components-figma-mcp-'));
  const headersPath = join(tempDir, 'headers.txt');
  const bodyPath = join(tempDir, 'body.txt');
  const args = [
    '-sS',
    '-X',
    'POST',
    endpoint,
    '-H',
    `content-type: application/json`,
    '-H',
    `accept: ${acceptHeader}`,
  ];

  if (sessionId) {
    args.push('-H', `mcp-session-id: ${sessionId}`);
  }
  if (authToken) {
    args.push('-H', `authorization: Bearer ${authToken}`);
  }

  args.push(
    '-D',
    headersPath,
    '-o',
    bodyPath,
    '--data',
    JSON.stringify(payload)
  );

  const startedMs = Date.now();
  const curlResult = runCommand('curl', args, {
    timeoutMs,
    allowFailure: true,
  });
  const durationMs = Date.now() - startedMs;

  const headersRaw = existsSync(headersPath)
    ? readFileSync(headersPath, 'utf8')
    : '';
  const bodyRaw = existsSync(bodyPath) ? readFileSync(bodyPath, 'utf8') : '';
  rmSync(tempDir, { recursive: true, force: true });

  const responseHeaders = parseHeaders(headersRaw);
  const contentType = responseHeaders.headers['content-type'] || '';
  const { parsed, sseMessages } = parseJsonRpcBody(bodyRaw, contentType);
  const transportError =
    curlResult.exitCode === 0
      ? null
      : curlResult.stderr ||
        curlResult.stdout ||
        `curl exit ${curlResult.exitCode}`;

  return {
    payload,
    transportError,
    response: {
      statusCode: responseHeaders.statusCode,
      statusLine: responseHeaders.statusLine,
      headers: responseHeaders.headers,
      headersRaw,
      contentType,
      bodyRaw,
      parsedJsonRpc: parsed,
      sseMessages,
      durationMs,
    },
    sessionId:
      responseHeaders.headers['mcp-session-id'] ||
      (sessionId ? String(sessionId) : null),
  };
}

function classifyTransportError(message) {
  const text = String(message ?? '').toLowerCase();
  if (!text) {
    return 'failed';
  }
  if (
    /(timed out|timeout|could not connect|connection refused|failed to connect|network|unavailable)/.test(
      text
    )
  ) {
    return 'unavailable';
  }
  return 'failed';
}

export function classifyJsonRpcCall(callRecord, options = {}) {
  const allowMissingPayload =
    options && typeof options === 'object'
      ? options.allowMissingPayload === true
      : false;

  if (callRecord.transportError) {
    return {
      status: classifyTransportError(callRecord.transportError),
      error: callRecord.transportError,
    };
  }

  const statusCode = callRecord.response.statusCode;
  if (statusCode !== null && statusCode >= 500) {
    return {
      status: 'unavailable',
      error: `HTTP ${statusCode}`,
    };
  }
  if (statusCode !== null && statusCode >= 400) {
    return {
      status: 'failed',
      error: `HTTP ${statusCode}`,
    };
  }

  const parsed = callRecord.response.parsedJsonRpc;
  if (!parsed || typeof parsed !== 'object') {
    if (
      allowMissingPayload &&
      statusCode !== null &&
      statusCode >= 200 &&
      statusCode < 300
    ) {
      return {
        status: 'ok',
        error: '',
      };
    }

    return {
      status: 'failed',
      error: 'Missing JSON-RPC response payload',
    };
  }

  if (parsed.error) {
    const message =
      parsed.error.message ||
      parsed.error.code ||
      JSON.stringify(parsed.error, null, 2);
    const status = classifyTransportError(message);
    return {
      status,
      error: String(message),
    };
  }

  const isError = Boolean(parsed.result?.isError);
  if (isError) {
    let toolErrorText = '';
    const content = Array.isArray(parsed.result?.content)
      ? parsed.result.content
      : [];
    for (const item of content) {
      if (item?.type === 'text' && item?.text) {
        toolErrorText += `${item.text}\n`;
      }
    }
    const normalizedMessage = toolErrorText.trim();
    return {
      status: classifyTransportError(normalizedMessage),
      error: normalizedMessage || 'Tool returned isError=true',
    };
  }

  return {
    status: 'ok',
    error: '',
  };
}

export function extractToolTextOutput(callRecord) {
  const parsed = callRecord.response.parsedJsonRpc;
  if (!parsed || typeof parsed !== 'object') {
    return '';
  }
  if (!parsed.result || typeof parsed.result !== 'object') {
    return '';
  }

  const content = Array.isArray(parsed.result.content)
    ? parsed.result.content
    : [];
  const chunks = [];
  for (const item of content) {
    if (item?.type === 'text' && typeof item.text === 'string') {
      chunks.push(item.text);
      continue;
    }
    if (item?.type === 'image') {
      const length = item?.data ? String(item.data).length : 0;
      const mimeType = item?.mimeType || 'unknown';
      chunks.push(
        `[image payload omitted mimeType=${mimeType} length=${length}]`
      );
    }
  }
  if (chunks.length > 0) {
    return chunks.join('\n');
  }

  return JSON.stringify(parsed.result, null, 2);
}

export function initializeFigmaMcpSession({ endpoint, timeoutMs, authToken }) {
  const initializePayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: {
        name: 'ui-components',
        version: '0.1.0',
      },
    },
  };

  const initializeCall = sendJsonRpcRequest({
    endpoint,
    sessionId: null,
    authToken,
    payload: initializePayload,
    timeoutMs,
  });
  const initializeState = classifyJsonRpcCall(initializeCall);
  if (initializeState.status !== 'ok') {
    return {
      ok: false,
      initializeCall,
      initializeState,
      initializedNotification: null,
      endpoint,
      sessionId: null,
    };
  }

  const sessionId = initializeCall.sessionId;
  const initializedNotificationPayload = {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: {},
  };
  const initializedNotification = sendJsonRpcRequest({
    endpoint,
    sessionId,
    authToken,
    payload: initializedNotificationPayload,
    timeoutMs,
  });

  return {
    ok: true,
    endpoint,
    sessionId,
    initializeCall,
    initializeState,
    initializedNotification,
  };
}

export function listFigmaMcpTools({
  endpoint,
  sessionId,
  authToken,
  timeoutMs,
  requestId = 2,
}) {
  return sendJsonRpcRequest({
    endpoint,
    sessionId,
    authToken,
    payload: {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/list',
      params: {},
    },
    timeoutMs,
  });
}

export function callFigmaMcpTool({
  endpoint,
  sessionId,
  authToken,
  timeoutMs,
  requestId,
  toolName,
  toolArguments,
}) {
  return sendJsonRpcRequest({
    endpoint,
    sessionId,
    authToken,
    payload: {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: toolArguments,
      },
    },
    timeoutMs,
  });
}
