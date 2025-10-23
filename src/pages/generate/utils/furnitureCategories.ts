export type FurnitureCategory =
  | 'lowerCabinet'
  | 'upperCabinet'
  | 'wardrobe'
  | 'builtInCloset'
  | 'chestOfDrawers'
  | 'storageCabinet';

export const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  'lowerCabinet',
  'upperCabinet',
  'wardrobe',
  'builtInCloset',
  'chestOfDrawers',
  'storageCabinet',
];

export const FURNITURE_CATEGORY_LABELS: Record<
  FurnitureCategory,
  { ko: string; en: string }
> = {
  lowerCabinet: { ko: '하부장', en: 'base cabinet' },
  upperCabinet: { ko: '상부장', en: 'wall cabinet' },
  wardrobe: { ko: '옷장', en: 'wardrobe' },
  builtInCloset: { ko: '붙박이장', en: 'built-in closet' },
  chestOfDrawers: { ko: '서랍장', en: 'chest of drawers' },
  storageCabinet: { ko: '수납장', en: 'storage cabinet' },
};

export const FURNITURE_CATEGORY_SET = new Set(FURNITURE_CATEGORIES);
