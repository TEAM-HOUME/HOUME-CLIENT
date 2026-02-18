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

export function parseHeaders(rawHeaders) {
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

export function parseJsonRpcBody(bodyRaw, contentType) {
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
