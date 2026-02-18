import { fail } from './errors.mjs';

export function parseFigmaUrl(figmaUrl) {
  let url;
  try {
    url = new URL(figmaUrl);
  } catch {
    fail(`Invalid Figma URL: ${figmaUrl}`);
  }

  const fileKeyMatch = url.pathname.match(/^\/design\/([^/]+)\//);
  if (!fileKeyMatch) {
    fail(`Figma URL is missing /design/<fileKey>/ path: ${figmaUrl}`);
  }

  const rawNodeId = url.searchParams.get('node-id');
  if (!rawNodeId) {
    fail(`Figma URL is missing node-id query parameter: ${figmaUrl}`);
  }

  const decodedNodeId = decodeURIComponent(rawNodeId);

  return {
    url: figmaUrl,
    fileKey: fileKeyMatch[1],
    nodeIdRaw: decodedNodeId,
    nodeIdNormalized: decodedNodeId.replace(/-/g, ':'),
  };
}

export function validateDesignContext(context) {
  if (!context || typeof context !== 'object') {
    fail('Design context must be an object.');
  }
  const requiredStringFields = ['url', 'fileKey', 'selectedNodeId', 'source'];
  for (const field of requiredStringFields) {
    if (typeof context[field] !== 'string' || !context[field].trim()) {
      fail(`Design context missing required field: ${field}`);
    }
  }
  if (!Array.isArray(context.parentChain)) {
    fail('Design context `parentChain` must be an array.');
  }
  if (!Array.isArray(context.childChain)) {
    fail('Design context `childChain` must be an array.');
  }
}
