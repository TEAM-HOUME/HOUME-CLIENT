export function formatDuration(durationMs) {
  if (durationMs < 1_000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1_000).toFixed(1)}s`;
}

export function toSingleLine(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

export function truncateText(value, maxLength = 160) {
  const normalized = toSingleLine(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function compactArray(values, maxItems = 3) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.slice(0, maxItems).map((value) => truncateText(value, 180));
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export function splitErrorDetails(errorMessage) {
  const text = String(errorMessage ?? '').trim();
  if (!text) {
    return {
      summary: '',
      details: [],
    };
  }

  const hasPipeDetails = text.includes(' | ');
  if (!hasPipeDetails) {
    return {
      summary: text,
      details: [],
    };
  }

  const colonIndex = text.indexOf(':');
  if (colonIndex === -1) {
    const chunks = text
      .split(/\s*\|\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
    return {
      summary: chunks.shift() || text,
      details: chunks,
    };
  }

  const summary = text.slice(0, colonIndex).trim();
  const detailText = text.slice(colonIndex + 1).trim();
  const details = detailText
    .split(/\s*\|\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    summary: summary || text,
    details,
  };
}
