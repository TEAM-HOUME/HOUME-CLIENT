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
