import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SEARCH_DIRS = ['src/shared/components', 'src/stories'];
const MAX_FILE_SCAN = 500;
const MAX_CANDIDATES = 5;
const MAX_FILE_READ_CHARS = 12_000;

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .split(/[^a-z0-9가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function toKeywordSet(context) {
  const keywords = new Set();
  const kind = String(context?.resolvedIntent?.componentKind || '')
    .toLowerCase()
    .trim();
  const state = String(context?.resolvedIntent?.state || '')
    .toLowerCase()
    .trim();
  const role = String(context?.resolvedIntent?.role || '')
    .toLowerCase()
    .trim();
  const page = String(context?.resolvedIntent?.page || '')
    .toLowerCase()
    .trim();
  const brief = String(context?.scenario?.intent?.brief || '')
    .toLowerCase()
    .trim();

  [kind, state, role, page, brief].forEach((value) => {
    tokenize(value).forEach((token) => keywords.add(token));
  });

  if (kind === 'snackbar') {
    keywords.add('toast');
    keywords.add('snackbar');
  }
  if (kind === 'toast') {
    keywords.add('toast');
    keywords.add('snackbar');
  }
  if (kind === 'bottom_sheet') {
    keywords.add('bottom');
    keywords.add('sheet');
    keywords.add('modal');
  }
  if (kind === 'modal') {
    keywords.add('modal');
    keywords.add('dialog');
  }
  return keywords;
}

function collectFilesRecursively(dirPath, target) {
  if (!existsSync(dirPath)) {
    return;
  }

  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    if (target.length >= MAX_FILE_SCAN) {
      return;
    }

    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFilesRecursively(fullPath, target);
      continue;
    }

    if (!/\.(ts|tsx|js|jsx|css|md)$/i.test(entry)) {
      continue;
    }
    target.push(fullPath);
  }
}

function scorePath(relativePath, keywords) {
  const lower = relativePath.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      score += 1;
    }
  }
  return score;
}

function extractAutoDismissMs(content) {
  const values = new Set();
  const patterns = [
    /setTimeout\s*\([^,]+,\s*(\d{2,6})\s*\)/g,
    /autoHideDuration\s*[:=]\s*(\d{2,6})/gi,
    /dismiss(?:After|Delay|Duration)?\s*[:=]\s*(\d{2,6})/gi,
    /duration\s*[:=]\s*(\d{2,6})/gi,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      const value = Number(match[1]);
      if (Number.isInteger(value) && value >= 100 && value <= 60_000) {
        values.add(value);
      }
      match = pattern.exec(content);
    }
  }

  return [...values].sort((a, b) => a - b);
}

function hasPattern(content, regex) {
  return regex.test(content);
}

function analyzeFile(fullPath, rootPath) {
  let content = '';
  try {
    content = readFileSync(fullPath, 'utf8').slice(0, MAX_FILE_READ_CHARS);
  } catch {
    return null;
  }

  return {
    path: relative(rootPath, fullPath).replace(/\\/g, '/'),
    autoDismissMs: extractAutoDismissMs(content),
    hasSafeArea: hasPattern(
      content,
      /safe-area-inset-bottom|safeArea|safe_area|env\(\s*safe-area/i
    ),
    hasNavigation: hasPattern(
      content,
      /navigate\s*\(|router\.push|router\.replace|href=|<Link|useNavigate/i
    ),
    hasDismiss: hasPattern(
      content,
      /dismiss|onClose|handleClose|close\b|swipe|outside\s*tap/i
    ),
  };
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function buildDefaultNote(clues) {
  const sections = [];
  if (clues.autoDismissMs.length > 0) {
    sections.push(`auto-dismiss=${clues.autoDismissMs.join('/')}ms`);
  }
  if (clues.hasSafeArea) {
    sections.push('safe-area 규칙 유지');
  }
  if (clues.hasNavigation) {
    sections.push('기존 라우팅 패턴 유지');
  }
  if (clues.hasDismiss) {
    sections.push('기존 dismiss 패턴 유지');
  }
  const fallback = '기존 컴포넌트 동작/레이아웃 규칙을 우선 적용';
  const summary = sections.length > 0 ? sections.join(', ') : fallback;
  const refText =
    clues.references.length > 0
      ? ` 참고: ${clues.references.slice(0, 3).join(', ')}`
      : '';
  return `애매한 사항은 코드베이스 기준으로 정리해 주세요 (${summary}).${refText}`;
}

export function collectIntentCodebaseGuidance(context) {
  const rootPath = context?.rootPath || process.cwd();
  const keywords = toKeywordSet(context);
  if (keywords.size === 0) {
    return null;
  }

  const files = [];
  for (const dir of SEARCH_DIRS) {
    collectFilesRecursively(resolve(rootPath, dir), files);
  }

  const scored = files
    .map((fullPath) => {
      const rel = relative(rootPath, fullPath).replace(/\\/g, '/');
      return {
        fullPath,
        relativePath: rel,
        score: scorePath(rel, keywords),
      };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.relativePath.localeCompare(b.relativePath)
    )
    .slice(0, MAX_CANDIDATES);

  if (scored.length === 0) {
    return {
      summaryLines: ['- 유사 코드 파일을 찾지 못했습니다.'],
      defaultNote:
        '애매한 사항은 기존 코드베이스 일반 규칙(문서/기존 패턴) 기준으로 정리해 주세요.',
      references: [],
    };
  }

  const analyses = scored
    .map((item) => analyzeFile(item.fullPath, rootPath))
    .filter(Boolean);

  const autoDismissMs = uniqueSorted(
    analyses.flatMap((item) => item.autoDismissMs || [])
  );
  const hasSafeArea = analyses.some((item) => item.hasSafeArea);
  const hasNavigation = analyses.some((item) => item.hasNavigation);
  const hasDismiss = analyses.some((item) => item.hasDismiss);
  const references = analyses.map((item) => item.path);

  const summaryLines = [
    `- 유사 파일(상위 ${references.length}): ${references.join(', ')}`,
    `- auto-dismiss 후보(ms): ${autoDismissMs.length > 0 ? autoDismissMs.join(', ') : '명시 패턴 없음'}`,
    `- safe-area 처리 패턴: ${hasSafeArea ? '있음' : '없음/불명확'}`,
    `- 라우팅/이동 처리 패턴: ${hasNavigation ? '있음' : '없음/불명확'}`,
    `- dismiss 처리 패턴: ${hasDismiss ? '있음' : '없음/불명확'}`,
  ];

  const defaultNote = buildDefaultNote({
    autoDismissMs,
    hasSafeArea,
    hasNavigation,
    hasDismiss,
    references,
  });

  return {
    summaryLines,
    defaultNote,
    references,
  };
}
