import {
  CORE_TOKEN_KEYS,
  TOKEN_KEYS,
  UNAVAILABLE_ERROR_PATTERN,
  VALID_STATUS,
} from './constants.mjs';

const STATUS_ALIAS_MAP = Object.freeze({
  ok: 'ok',
  success: 'ok',
  succeeded: 'ok',
  completed: 'ok',
  complete: 'ok',
  done: 'ok',
  passed: 'ok',
  pass: 'ok',
  partial: 'partial',
  unavailable: 'unavailable',
  cancelled: 'unavailable',
  canceled: 'unavailable',
  invalid: 'invalid',
  failed: 'invalid',
  failure: 'invalid',
  error: 'invalid',
  errored: 'invalid',
});

export function normalizeStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  const canonical = STATUS_ALIAS_MAP[normalized] || normalized;
  if (!VALID_STATUS.has(canonical)) {
    return 'invalid';
  }
  return canonical;
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

export function normalizeToolRecord(rawRecord, toolLabel) {
  const record =
    rawRecord && typeof rawRecord === 'object' && !Array.isArray(rawRecord)
      ? rawRecord
      : {};
  return {
    tool: toolLabel,
    status: normalizeStatus(record.status),
    output: normalizeText(record.output),
    error: normalizeText(record.error),
  };
}

function normalizeTokenItem(rawItem) {
  const item =
    rawItem && typeof rawItem === 'object' && !Array.isArray(rawItem)
      ? rawItem
      : {};
  return {
    name: normalizeText(item.name),
    value: normalizeText(item.value),
    source: normalizeText(item.source),
    nodeId: normalizeText(item.nodeId),
    note: normalizeText(item.note),
  };
}

export function normalizeTokenList(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return rawList.map(normalizeTokenItem);
}

export function normalizeDiagnostics(rawDiagnostics) {
  const diagnostics =
    rawDiagnostics &&
    typeof rawDiagnostics === 'object' &&
    !Array.isArray(rawDiagnostics)
      ? rawDiagnostics
      : {};
  const warnings = Array.isArray(diagnostics.warnings)
    ? diagnostics.warnings.map(normalizeText).filter(Boolean)
    : [];
  const errors = Array.isArray(diagnostics.errors)
    ? diagnostics.errors.map(normalizeText).filter(Boolean)
    : [];
  return { warnings, errors };
}

function hasUnavailableSignal(toolRecord) {
  if (toolRecord.status === 'unavailable') {
    return true;
  }
  const errorText = toolRecord.error.toLowerCase();
  if (!errorText) {
    return false;
  }
  return UNAVAILABLE_ERROR_PATTERN.test(errorText);
}

export function calculateTokenStats(tokens) {
  const countsByCategory = Object.fromEntries(
    TOKEN_KEYS.map((category) => [category, tokens[category].length])
  );
  const totalTokens = TOKEN_KEYS.reduce(
    (acc, category) => acc + tokens[category].length,
    0
  );
  const coreCoverage = CORE_TOKEN_KEYS.filter(
    (category) => tokens[category].length > 0
  ).length;
  return {
    countsByCategory,
    totalTokens,
    coreCoverage,
  };
}

export function deriveCaptureStatus(toolRecords, diagnostics, stats) {
  if (toolRecords.some(hasUnavailableSignal)) {
    return 'unavailable';
  }
  if (
    diagnostics.errors.length > 0 ||
    toolRecords.some((tool) => tool.status === 'invalid')
  ) {
    return 'invalid';
  }

  const hasAnyEvidence = toolRecords.some(
    (tool) => tool.output.length > 0 || tool.error.length > 0
  );
  if (!hasAnyEvidence) {
    return 'invalid';
  }

  if (stats.totalTokens === 0 || stats.coreCoverage < 2) {
    return 'partial';
  }
  if (toolRecords.some((tool) => tool.status === 'partial')) {
    return 'partial';
  }

  return 'ok';
}

export function directToolRecordToCaptureRecord(record, fallbackToolName) {
  if (!record || typeof record !== 'object') {
    return null;
  }
  return normalizeToolRecord(record, fallbackToolName);
}
