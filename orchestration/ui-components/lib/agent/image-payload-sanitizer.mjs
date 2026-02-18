function normalizeLength(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.trunc(numeric);
}

const LARGE_PAYLOAD_LINE_LENGTH = 2048;
const DATA_URI_PATTERN = /data:image\/[a-z0-9.+-]+;base64,/i;
const BASE64_LINE_PATTERN = /^[A-Za-z0-9+/=\s]+$/;

export function buildImagePayloadRedaction({ length = 0, mimeType = '' } = {}) {
  const normalizedLength = normalizeLength(length);
  const normalizedMimeType = String(mimeType || '').trim();
  if (normalizedMimeType) {
    return `[image payload omitted mimeType=${normalizedMimeType} length=${normalizedLength}]`;
  }
  return `[image payload omitted length=${normalizedLength}]`;
}

export function redactImagePayloadText(value) {
  const text = String(value || '');
  if (!text) {
    return '';
  }
  return buildImagePayloadRedaction({ length: text.length });
}

function hasLargeBase64LikeLine(text) {
  const lines = String(text || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < LARGE_PAYLOAD_LINE_LENGTH) {
      continue;
    }
    if (!BASE64_LINE_PATTERN.test(trimmed)) {
      continue;
    }
    return true;
  }
  return false;
}

function detectCommandPayloadReason(text) {
  const normalized = String(text || '');
  if (!normalized) {
    return '';
  }
  if (DATA_URI_PATTERN.test(normalized)) {
    return 'inline_data_uri';
  }
  if (hasLargeBase64LikeLine(normalized)) {
    return 'base64_like_line';
  }
  return '';
}

function sanitizeCommandExecutionOutput(value) {
  const text = String(value || '');
  if (!text) {
    return text;
  }
  const reason = detectCommandPayloadReason(text);
  if (!reason) {
    return text;
  }
  return `[command output omitted reason=${reason} length=${text.length}]`;
}

export function sanitizeImagePayloadValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeImagePayloadValue(item));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    sanitized[key] = sanitizeImagePayloadValue(nested);
  }

  if (value.type === 'image' && typeof value.data === 'string') {
    sanitized.data = buildImagePayloadRedaction({
      length: value.data.length,
      mimeType: value.mimeType,
    });
  }
  if (
    value.type === 'command_execution' &&
    typeof value.aggregated_output === 'string'
  ) {
    sanitized.aggregated_output = sanitizeCommandExecutionOutput(
      value.aggregated_output
    );
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
    return JSON.stringify(sanitizeImagePayloadValue(parsed));
  } catch {
    return raw;
  }
}

export function sanitizeImagePayloadJsonLines(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => sanitizeJsonLine(line))
    .join('\n');
}
