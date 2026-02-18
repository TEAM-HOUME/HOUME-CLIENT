const COMPONENT_KIND_ALIAS_GROUPS = {
  toast: ['toast', '토스트', 'notification', 'notify'],
  snackbar: ['snackbar', 'snack bar', 'snack', '스낵바'],
  modal: ['modal', 'popup', 'pop-up', '팝업', '모달'],
  alert: ['alert', 'alert dialog', 'alert_dialog', '알럿', '경고', '경고창'],
  callout: ['callout', 'note box', 'hint box', '콜아웃', '안내박스'],
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
  context_menu: [
    'context_menu',
    'context menu',
    'right click menu',
    '컨텍스트 메뉴',
    '우클릭 메뉴',
  ],
  tabs: ['tabs', 'tab', 'tab bar', '탭', '탭바'],
  accordion: ['accordion', 'expandable', '아코디언', '확장 패널'],
  carousel: ['carousel', 'slider', 'slide', '캐러셀', '슬라이더'],
  pagination: ['pagination', 'pager', '페이지네이션', '페이지 이동'],
  breadcrumb: ['breadcrumb', 'breadcrumbs', '브레드크럼'],
  stepper: ['stepper', 'steps', 'wizard step', '스텝퍼', '단계 표시'],
  combobox: ['combobox', 'combo box', 'autocomplete', 'auto complete'],
  date_picker: ['date_picker', 'date picker', 'datepicker', '날짜 선택'],
  time_picker: ['time_picker', 'time picker', 'timepicker', '시간 선택'],
  file_upload: ['file_upload', 'file upload', 'upload', '파일 업로드'],
  segmented_control: [
    'segmented_control',
    'segmented control',
    'segment control',
    '세그먼트',
  ],
  range_slider: [
    'range_slider',
    'range slider',
    'slider range',
    '범위 슬라이더',
  ],
  chip: ['chip', 'tag pill', '칩', '태그'],
  card: ['card', 'tile', '카드', '타일'],
  table: ['table', 'grid', 'datatable', 'data table', '테이블'],
  avatar: ['avatar', 'profile image', '프로필 이미지', '아바타'],
  badge: ['badge', 'label', '뱃지', '배지'],
  timeline: ['timeline', 'activity timeline', '타임라인'],
  tree: ['tree', 'tree view', '트리', '트리뷰'],
  calendar: ['calendar', '캘린더'],
  chart: ['chart', 'graph', '차트', '그래프'],
  map: ['map', '지도'],
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
  search_bar: ['search_bar', 'search bar', 'search input', '검색바'],
  filter_bar: ['filter_bar', 'filter bar', 'filters', '필터바'],
  filter_chip_group: [
    'filter_chip_group',
    'filter chip group',
    'chip group',
    '필터 칩 그룹',
  ],
  progress: ['progress', 'progress bar', 'loader', '진행바', '로더'],
  skeleton: ['skeleton', 'loading placeholder', '스켈레톤', '플레이스홀더'],
  image: ['image', 'img', '사진', '이미지'],
  icon: ['icon', 'glyph', '아이콘'],
  illustration: ['illustration', 'illust', '일러스트'],
  video: ['video', 'player', '영상', '비디오'],
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
  'alert',
  'callout',
  'bottom_sheet',
  'drawer',
  'sheet',
  'popover',
  'dropdown',
  'menu',
  'context_menu',
  'tabs',
  'accordion',
  'carousel',
  'pagination',
  'breadcrumb',
  'stepper',
  'combobox',
  'date_picker',
  'time_picker',
  'file_upload',
  'segmented_control',
  'range_slider',
  'chip',
  'card',
  'table',
  'avatar',
  'badge',
  'timeline',
  'tree',
  'calendar',
  'chart',
  'map',
  'list_item',
  'empty_state',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'switch',
  'search_bar',
  'filter_bar',
  'filter_chip_group',
  'progress',
  'skeleton',
  'image',
  'icon',
  'illustration',
  'video',
  'unknown',
];

export const ROLE_ENUM = ['global', 'local', 'inline', 'unknown'];

export const INTERACTION_COMPONENT_KINDS = new Set([
  'modal',
  'dialog',
  'alert',
  'bottom_sheet',
  'drawer',
  'sheet',
  'popover',
  'dropdown',
  'menu',
  'context_menu',
  'carousel',
  'combobox',
  'date_picker',
  'time_picker',
  'file_upload',
  'segmented_control',
  'range_slider',
  'search_bar',
  'filter_bar',
  'tabs',
  'accordion',
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
