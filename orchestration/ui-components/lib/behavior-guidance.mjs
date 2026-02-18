export const BEHAVIOR_CONFIG_PATHS = Object.freeze({
  confirmed: 'scenario.behavior.confirmed',
  spec: 'scenario.behavior.spec',
});

function normalizeComponentKind(value) {
  const text = String(value ?? '').trim();
  if (!text || text === 'unknown') {
    return null;
  }
  return text;
}

function formatInteractionLabel(componentKind) {
  const normalized = normalizeComponentKind(componentKind);
  if (!normalized) {
    return '인터랙션 컴포넌트';
  }
  return `인터랙션 컴포넌트(${normalized})`;
}

function toBehaviorQuestions(behaviorQuestions) {
  if (!Array.isArray(behaviorQuestions)) {
    return [];
  }
  return behaviorQuestions
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
}

export function readBehaviorConfig(scenario) {
  return {
    confirmed: Boolean(scenario?.behavior?.confirmed),
    spec: String(scenario?.behavior?.spec ?? '').trim(),
  };
}

export function buildBehaviorConfirmationRequiredMessage({
  componentKind,
  intentSummary = '',
  behaviorQuestions = [],
}) {
  const messageParts = [
    `${formatInteractionLabel(componentKind)} 세부 동작 명세 필요로 판정되었습니다.`,
  ];
  const normalizedSummary = String(intentSummary ?? '').trim();
  if (normalizedSummary) {
    messageParts.push(`intent 근거 ${normalizedSummary}`);
  }
  const questions = toBehaviorQuestions(behaviorQuestions);
  if (questions.length > 0) {
    messageParts.push(`추가 확인 질문 ${questions.join(' / ')}`);
  }
  return messageParts.join(' | ');
}

export function buildBehaviorSpecMissingMessage({
  componentKind,
  intentSummary = '',
}) {
  const messageParts = [
    `${formatInteractionLabel(componentKind)} 세부 동작 명세가 비어 있습니다.`,
  ];
  const normalizedSummary = String(intentSummary ?? '').trim();
  if (normalizedSummary) {
    messageParts.push(`intent 근거 ${normalizedSummary}`);
  }
  return messageParts.join(' | ');
}

export function buildBehaviorRetryHintForConfirmation({ componentKind }) {
  return `${formatInteractionLabel(componentKind)} 세부 동작 명세 필요로 판정됨`;
}

export function buildBehaviorRetryHintForMissingSpec({ componentKind }) {
  return `${formatInteractionLabel(componentKind)} 세부 동작 명세 누락`;
}
