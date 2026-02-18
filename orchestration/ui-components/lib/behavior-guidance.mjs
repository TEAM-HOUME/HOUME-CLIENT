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
  behaviorQuestions = [],
}) {
  const messageParts = [
    `${formatInteractionLabel(componentKind)} 동작 정의 확인이 필요합니다.`,
    '시나리오에서 동작 확정 여부를 true로 설정해 주세요.',
    '동작 상세 설명에 트리거/배치/닫힘/CTA/중복 처리/접근성 기준을 포함해 주세요.',
  ];
  const questions = toBehaviorQuestions(behaviorQuestions);
  if (questions.length > 0) {
    messageParts.push(`추가 확인 질문 ${questions.join(' / ')}`);
  }
  return messageParts.join(' | ');
}

export function buildBehaviorSpecMissingMessage({ componentKind }) {
  return [
    `${formatInteractionLabel(componentKind)} 동작 확정은 되었지만 상세 설명이 비어 있습니다.`,
    '구현 전에 트리거/배치/닫힘/CTA/중복 처리/접근성 기준을 포함해 동작을 작성해 주세요.',
  ].join(' | ');
}

export function buildBehaviorRetryHintForConfirmation({ componentKind }) {
  return [
    `${formatInteractionLabel(componentKind)} 동작 정의 보강 필요`,
    '시나리오에서 동작 확정 여부를 true로 설정하고 동작 상세 설명을 작성해 주세요.',
  ].join(': ');
}

export function buildBehaviorRetryHintForMissingSpec({ componentKind }) {
  return [
    `${formatInteractionLabel(componentKind)} 동작 상세 설명 누락`,
    '트리거/배치/닫힘/CTA/중복 처리/접근성 기준을 포함해 작성해 주세요.',
  ].join(': ');
}
