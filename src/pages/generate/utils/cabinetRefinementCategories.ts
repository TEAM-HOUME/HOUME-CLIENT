export type CabinetRefinementCategory =
  | 'lowerCabinet'
  | 'upperCabinet'
  | 'wardrobe'
  | 'builtInCloset'
  | 'chestOfDrawers'
  | 'storageCabinet';

// Cabinet/Shelf 2차 분류에서만 사용하는 카테고리 목록
export const CABINET_REFINEMENT_CATEGORIES = [
  'lowerCabinet',
  'upperCabinet',
  'wardrobe',
  'builtInCloset',
  'chestOfDrawers',
  'storageCabinet',
] as const satisfies readonly CabinetRefinementCategory[];

// 2차 분류 라벨(한글/영문)도 읽기 전용으로 고정
export const CABINET_REFINEMENT_CATEGORY_LABELS = {
  lowerCabinet: { ko: '하부장', en: 'base cabinet' },
  upperCabinet: { ko: '상부장', en: 'wall cabinet' },
  wardrobe: { ko: '옷장', en: 'wardrobe' },
  builtInCloset: { ko: '붙박이장', en: 'built-in closet' },
  chestOfDrawers: { ko: '서랍장', en: 'chest of drawers' },
  storageCabinet: { ko: '수납장', en: 'storage cabinet' },
} as const satisfies Readonly<
  Record<CabinetRefinementCategory, { ko: string; en: string }>
>;

// 빠른 조회용 Set
export const CABINET_REFINEMENT_CATEGORY_SET =
  new Set<CabinetRefinementCategory>(CABINET_REFINEMENT_CATEGORIES);
