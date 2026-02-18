import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCommand } from '../agent.mjs';
import { parseHeaders, parseJsonRpcBody } from './response-parser.mjs';

const DEFAULT_ACCEPT_HEADER = 'application/json, text/event-stream';

export function sendJsonRpcRequest({
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
