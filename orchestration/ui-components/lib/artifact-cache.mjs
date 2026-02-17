import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

function normalizeForStableHash(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForStableHash(item));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, normalizeForStableHash(nested)]);
    return Object.fromEntries(entries);
  }
  return value;
}

export function createCacheKey(payload) {
  const normalized = normalizeForStableHash(payload);
  const serialized = JSON.stringify(normalized);
  return createHash('sha1').update(serialized).digest('hex');
}

function listArtifactCandidates(artifactsDir, suffix) {
  return readdirSync(artifactsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.endsWith(suffix))
    .map((entry) => {
      const artifactPath = resolve(artifactsDir, entry.name);
      const mtimeMs = statSync(artifactPath).mtimeMs;
      return {
        artifactPath,
        mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function readJsonSafe(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function findCachedArtifact({ artifactsDir, suffix, cacheKey, accept }) {
  const candidates = listArtifactCandidates(artifactsDir, suffix);
  for (const candidate of candidates) {
    const data = readJsonSafe(candidate.artifactPath);
    if (!data) {
      continue;
    }
    if (cacheKey && data?.cache?.key !== cacheKey) {
      continue;
    }
    if (typeof accept === 'function' && !accept(data)) {
      continue;
    }
    return {
      artifactPath: candidate.artifactPath,
      data,
    };
  }
  return null;
}
