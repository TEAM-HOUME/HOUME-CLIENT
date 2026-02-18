function normalizeLength(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.trunc(numeric);
}

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
