export const TOOL_KEYS = [
  'designContext',
  'variableDefs',
  'metadata',
  'screenshot',
];

export const CORE_TOKEN_KEYS = ['colors', 'typography', 'spacing'];

export const TOKEN_KEYS = [
  'colors',
  'typography',
  'spacing',
  'radius',
  'size',
  'extras',
];

export const VALID_STATUS = new Set([
  'ok',
  'partial',
  'unavailable',
  'invalid',
]);

export const UNAVAILABLE_ERROR_PATTERN =
  /\b(401|403|unauthorized|forbidden|timeout|timed out|connection refused|econn|enotfound|not configured|service unavailable)\b/;

export const CACHE_SCHEMA_VERSION = 'figma-design-tokens-cache.v2';
