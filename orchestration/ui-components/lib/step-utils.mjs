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
  void maxLength;
  return toSingleLine(value);
}

export function compactArray(values, maxItems = 3) {
  void maxItems;
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => truncateText(value, 180));
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

const UI_LOCALIZATION_REPLACEMENTS = [
  [
    'Intent ambiguities require clarification',
    'Intent 모호점 확인이 필요합니다',
  ],
  ['Intent confidence is low', 'Intent 신뢰도가 낮습니다'],
  ['Intent fields are missing', 'Intent 필드가 누락되었습니다'],
  [
    'Visual asset coverage mismatch detected',
    '시각 자산 커버리지 불일치가 감지되었습니다',
  ],
  [
    'Visual asset coverage is unknown',
    '시각 자산 커버리지를 확정할 수 없습니다',
  ],
  ['Asset coverage assessment failed', '자산 커버리지 판정에 실패했습니다'],
  ['Figma MCP initialize probe failed', 'Figma MCP 초기화 점검에 실패했습니다'],
  [
    'Figma MCP tools/list probe failed',
    'Figma MCP tools/list 점검에 실패했습니다',
  ],
  [
    'Figma MCP required tools are missing',
    'Figma MCP 필수 도구가 누락되었습니다',
  ],
  ['Missing required command(s)', '필수 명령어가 없습니다'],
  [
    'Design token capture status is unavailable',
    '디자인 토큰 캡처를 사용할 수 없습니다',
  ],
  [
    'Design token capture status is partial',
    '디자인 토큰 캡처 상태가 partial입니다',
  ],
  [
    'Design token capture status is invalid',
    '디자인 토큰 캡처 상태가 invalid입니다',
  ],
  [
    'Design token capture is missing in context',
    '디자인 토큰 캡처 결과가 컨텍스트에 없습니다',
  ],
  [
    'Figma MCP raw tool logs are missing',
    'Figma MCP 원본 도구 로그가 없습니다',
  ],
  [
    'Missing required Figma MCP tool calls',
    '필수 Figma MCP 도구 호출이 누락되었습니다',
  ],
  [
    'Figma MCP tool calls did not pass quality gate',
    'Figma MCP 도구 호출이 품질 게이트를 통과하지 못했습니다',
  ],
  [
    'No node could be found for the provided nodeId',
    '지정한 nodeId를 찾을 수 없습니다',
  ],
  [
    'Make sure the Figma desktop app is open and the document containing the node is the active tab.',
    'Figma 데스크톱 앱이 열려 있고 해당 노드가 포함된 문서 탭이 활성 상태인지 확인해 주세요.',
  ],
  [
    'An error occurred while using the tool',
    '도구 실행 중 오류가 발생했습니다',
  ],
];

export function localizeUiMessage(value) {
  let text = String(value ?? '').trim();
  if (!text) {
    return '';
  }
  for (const [source, target] of UI_LOCALIZATION_REPLACEMENTS) {
    text = text.replaceAll(source, target);
  }
  return text;
}

export function splitErrorDetails(errorMessage) {
  const text = localizeUiMessage(errorMessage);
  if (!text) {
    return {
      summary: '',
      details: [],
    };
  }

  const hasPipeDetails = text.includes(' | ');
  if (!hasPipeDetails) {
    return {
      summary: localizeUiMessage(text),
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
      summary: localizeUiMessage(chunks.shift() || text),
      details: chunks.map((item) => localizeUiMessage(item)),
    };
  }

  const summary = text.slice(0, colonIndex).trim();
  const detailText = text.slice(colonIndex + 1).trim();
  const details = detailText
    .split(/\s*\|\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    summary: localizeUiMessage(summary || text),
    details: details.map((item) => localizeUiMessage(item)),
  };
}
