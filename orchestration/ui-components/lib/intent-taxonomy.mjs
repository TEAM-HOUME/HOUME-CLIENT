const COMPONENT_KIND_ALIAS_GROUPS = {
  toast: ['toast', '토스트', 'notification', 'notify'],
  snackbar: ['snackbar', 'snack bar', 'snack', '스낵바'],
  modal: ['modal', 'popup', 'pop-up', '팝업', '모달'],
  bottom_sheet: [
    'bottom_sheet',
    'bottomsheet',
    'bottom sheet',
    'action sheet',
    '바텀시트',
    '하단시트',
  ],
  dialog: ['dialog', 'alert', 'confirm', '다이얼로그', '알림창', '확인창'],
  sheet: ['sheet', 'panel', '시트', '패널'],
  drawer: ['drawer', 'side panel', 'sidebar', '드로어', '사이드바'],
  banner: ['banner', 'top banner', '배너'],
  tooltip: ['tooltip', 'tip', '툴팁'],
  popover: ['popover', 'pop over', 'floating panel', '플로팅 패널'],
  dropdown: ['dropdown', 'drop-down', 'drop down', '드롭다운'],
  menu: ['menu', 'context menu', '메뉴', '컨텍스트 메뉴'],
  tabs: ['tabs', 'tab', 'tab bar', '탭', '탭바'],
  accordion: ['accordion', 'expandable', '아코디언', '확장 패널'],
  carousel: ['carousel', 'slider', 'slide', '캐러셀', '슬라이더'],
  chip: ['chip', 'tag pill', '칩', '태그'],
  card: ['card', 'tile', '카드', '타일'],
  list_item: [
    'list_item',
    'list item',
    'list-item',
    'listitem',
    'row',
    'cell',
    '리스트 아이템',
    '리스트 항목',
  ],
  empty_state: [
    'empty_state',
    'empty state',
    'empty-state',
    'zero state',
    '빈 상태',
    '없음 상태',
  ],
  input: ['input', 'text field', 'textfield', '필드', '입력필드'],
  textarea: ['textarea', 'text area', 'multi-line input', '멀티라인'],
  select: ['select', 'picker', 'selectbox', 'select box', '셀렉트', '피커'],
  checkbox: ['checkbox', 'check box', '체크박스'],
  radio: ['radio', 'radio button', '라디오', '라디오버튼'],
  switch: ['switch', 'toggle', '토글', '스위치'],
  progress: ['progress', 'progress bar', 'loader', '진행바', '로더'],
  skeleton: ['skeleton', 'loading placeholder', '스켈레톤', '플레이스홀더'],
};

const ROLE_ALIAS_GROUPS = {
  global: ['global', 'app-wide', 'app wide', 'system', '전역', '공통'],
  local: ['local', 'screen', 'page', 'view', '로컬', '화면', '페이지', '뷰'],
  inline: [
    'inline',
    'in-place',
    'in place',
    'item-level',
    'item level',
    'card-level',
    'card level',
    '인라인',
    '항목내',
    '항목 내',
    '카드내',
    '카드 내',
  ],
};

export const COMPONENT_KIND_ENUM = [
  'toast',
  'snackbar',
  'banner',
  'tooltip',
  'modal',
  'dialog',
  'bottom_sheet',
  'drawer',
  'sheet',
  'popover',
  'dropdown',
  'menu',
  'tabs',
  'accordion',
  'carousel',
  'chip',
  'card',
  'list_item',
  'empty_state',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'switch',
  'progress',
  'skeleton',
  'unknown',
];

export const ROLE_ENUM = ['global', 'local', 'inline', 'unknown'];

export const INTERACTION_COMPONENT_KINDS = new Set([
  'modal',
  'dialog',
  'bottom_sheet',
  'drawer',
  'sheet',
  'popover',
  'dropdown',
  'menu',
  'carousel',
]);

function normalizeToken(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[/\\]+/g, ' ')
    .replace(/[\s-]+/g, '_');
}

function buildAliasMap(aliasGroups) {
  const map = new Map();
  for (const [canonical, aliases] of Object.entries(aliasGroups)) {
    map.set(normalizeToken(canonical), canonical);
    aliases.forEach((alias) => map.set(normalizeToken(alias), canonical));
  }
  return map;
}

function normalizeWithAliases(value, allowed, aliasMap, fallback) {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return fallback;
  }
  if (aliasMap.has(normalized)) {
    return aliasMap.get(normalized);
  }
  if (allowed.includes(normalized)) {
    return normalized;
  }
  return fallback;
}

const componentKindAliasMap = buildAliasMap(COMPONENT_KIND_ALIAS_GROUPS);
const roleAliasMap = buildAliasMap(ROLE_ALIAS_GROUPS);

export function normalizeComponentKind(value, fallback = 'unknown') {
  return normalizeWithAliases(
    value,
    COMPONENT_KIND_ENUM,
    componentKindAliasMap,
    fallback
  );
}

export function normalizeRole(value, fallback = 'unknown') {
  return normalizeWithAliases(value, ROLE_ENUM, roleAliasMap, fallback);
}
