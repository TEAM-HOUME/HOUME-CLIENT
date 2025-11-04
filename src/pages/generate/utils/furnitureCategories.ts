export type FurnitureCategory =
  | 'lowerCabinet'
  | 'upperCabinet'
  | 'wardrobe'
  | 'builtInCloset'
  | 'chestOfDrawers'
  | 'storageCabinet';

// 가구 카테고리는 읽기 전용으로 유지
export const FURNITURE_CATEGORIES = [
  'lowerCabinet',
  'upperCabinet',
  'wardrobe',
  'builtInCloset',
  'chestOfDrawers',
  'storageCabinet',
] as const satisfies readonly FurnitureCategory[];

// 카테고리 라벨도 읽기 전용으로 유지
export const FURNITURE_CATEGORY_LABELS = {
  lowerCabinet: { ko: '하부장', en: 'base cabinet' },
  upperCabinet: { ko: '상부장', en: 'wall cabinet' },
  wardrobe: { ko: '옷장', en: 'wardrobe' },
  builtInCloset: { ko: '붙박이장', en: 'built-in closet' },
  chestOfDrawers: { ko: '서랍장', en: 'chest of drawers' },
  storageCabinet: { ko: '수납장', en: 'storage cabinet' },
} as const satisfies Readonly<
  Record<FurnitureCategory, { ko: string; en: string }>
>;

// 빠른 조회를 위해 읽기 전용 목록을 기반으로 Set 구성
export const FURNITURE_CATEGORY_SET = new Set<FurnitureCategory>(
  FURNITURE_CATEGORIES
);
