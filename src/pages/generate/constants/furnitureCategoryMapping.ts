import { OBJ365_ALL_CLASSES } from '../utils/obj365AllClasses';
import { OBJ365_FURNITURE_INDEX_SET } from '../utils/obj365Furniture';

import type { FurnitureCategory } from '../utils/furnitureCategories';

// 허용 FurnitureCategoryCode 목록
export const FURNITURE_CATEGORY_CODES = [
  'SINGLE',
  'OFFICE_DESK',
  'CLOSET',
  'DINING_TABLE',
  'SINGLE_SOFA',
  'DRAWER',
  'MOVABLE_TV',
  'SITTING_TABLE',
  'MIRROR',
  'WHITE_BOOKSHELF',
  'DISPLAY_CABINET',
  'TWO_SEATER_SOFA',
] as const;

export type FurnitureCategoryCode = (typeof FURNITURE_CATEGORY_CODES)[number];

// 허용 코드 집합 캐싱
export const FURNITURE_CATEGORY_CODE_SET = new Set<FurnitureCategoryCode>(
  FURNITURE_CATEGORY_CODES
);

const normalizeFurnitureLabelKey = (raw: string | null | undefined) =>
  raw
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') ?? '';

const uniqueCodes = (codes: FurnitureCategoryCode[]) => {
  const seen = new Set<FurnitureCategoryCode>();
  codes.forEach((code) => {
    if (FURNITURE_CATEGORY_CODE_SET.has(code) && !seen.has(code)) {
      seen.add(code);
    }
  });
  return Array.from(seen);
};

const defineLabelMap = (): Record<string, FurnitureCategoryCode[]> => {
  const entries: Array<[string, FurnitureCategoryCode[]]> = [
    ['Bed', ['SINGLE']],
    ['Single Bed', ['SINGLE']],
    ['Desk', ['OFFICE_DESK']],
    ['Cabinet/shelf', ['DISPLAY_CABINET']],
    ['Dining Table', ['DINING_TABLE']],
    ['Chair', ['SINGLE_SOFA']],
    ['Bench', ['SINGLE_SOFA']],
    ['Stool', ['SINGLE_SOFA']],
    ['one seater sofa', ['SINGLE_SOFA']],
    ['Storage box', ['DRAWER']],
    ['Nightstand', ['DRAWER']],
    ['drawer', ['DRAWER']],
    ['Monitor/TV', ['MOVABLE_TV']],
    ['Coffee Table', ['SITTING_TABLE']],
    ['Side Table', ['SITTING_TABLE']],
    ['Mirror', ['MIRROR']],
    ['Couch', ['TWO_SEATER_SOFA']],
    ['Sofa', ['TWO_SEATER_SOFA']],
    ['two seater sofa', ['TWO_SEATER_SOFA']],
    ['base cabinet', ['DISPLAY_CABINET']],
    ['wall cabinet', ['WHITE_BOOKSHELF']],
    ['wardrobe', ['CLOSET']],
    ['built-in closet', ['CLOSET']],
    ['built in closet', ['CLOSET']],
    ['storage cabinet', ['DISPLAY_CABINET']],
    ['chest of drawers', ['DRAWER']],
  ];
  return entries.reduce<Record<string, FurnitureCategoryCode[]>>(
    (acc, [label, codes]) => {
      const key = normalizeFurnitureLabelKey(label);
      if (!key) return acc;
      acc[key] = uniqueCodes([...(acc[key] ?? []), ...codes]);
      return acc;
    },
    {}
  );
};

const FINAL_LABEL_MAP = defineLabelMap();

const OBJ365_TO_CODE: Record<number, FurnitureCategoryCode[]> = {
  75: ['SINGLE'],
  9: ['OFFICE_DESK'],
  12: ['CLOSET', 'WHITE_BOOKSHELF', 'DISPLAY_CABINET'],
  98: ['DINING_TABLE'],
  2: ['SINGLE_SOFA'],
  24: ['SINGLE_SOFA'],
  47: ['SINGLE_SOFA'],
  20: ['DRAWER'],
  121: ['DRAWER'],
  37: ['MOVABLE_TV'],
  167: ['SITTING_TABLE'],
  168: ['SITTING_TABLE'],
  79: ['MIRROR'],
  50: ['TWO_SEATER_SOFA'],
} as const;

const CABINET_CATEGORY_TO_CODE: Record<
  FurnitureCategory,
  FurnitureCategoryCode
> = {
  lowerCabinet: 'DISPLAY_CABINET',
  upperCabinet: 'WHITE_BOOKSHELF',
  wardrobe: 'CLOSET',
  builtInCloset: 'CLOSET',
  storageCabinet: 'DISPLAY_CABINET',
  chestOfDrawers: 'DRAWER',
};

const getCodeFromFinalLabel = (
  label: string | null | undefined
): FurnitureCategoryCode | null => {
  const key = normalizeFurnitureLabelKey(label);
  if (!key) return null;
  const codes = FINAL_LABEL_MAP[key] ?? [];
  return codes[0] ?? null;
};

const getCodeFromObj365Label = (
  label: number | null | undefined
): FurnitureCategoryCode | null => {
  if (typeof label !== 'number') return null;
  const codes = OBJ365_TO_CODE[label];
  return codes?.[0] ?? null;
};

const getCodeFromRefinedLabel = (
  refined: FurnitureCategory | undefined
): FurnitureCategoryCode | null => {
  if (!refined) return null;
  return CABINET_CATEGORY_TO_CODE[refined] ?? null;
};

export const resolveFurnitureCodes = (input: {
  finalLabel?: string | null;
  obj365Label?: number | null;
  refinedLabel?: FurnitureCategory;
  refinedConfidence?: number;
}): FurnitureCategoryCode[] => {
  const code = resolveFurnitureCode(input);
  return code ? [code] : [];
};

export const resolveFurnitureCode = (input: {
  finalLabel?: string | null;
  obj365Label?: number | null;
  refinedLabel?: FurnitureCategory;
  refinedConfidence?: number;
}): FurnitureCategoryCode | null => {
  const refinedCode = getCodeFromRefinedLabel(input.refinedLabel);
  if (refinedCode) return refinedCode;

  const finalCode = getCodeFromFinalLabel(input.finalLabel);
  if (finalCode) return finalCode;

  const objCode = getCodeFromObj365Label(input.obj365Label);
  if (objCode) return objCode;

  return null;
};

export const hasFurnitureCodeForIndex = (
  idx: number | null | undefined
): boolean => {
  if (typeof idx !== 'number') return false;
  if (!OBJ365_FURNITURE_INDEX_SET.has(idx)) return false;
  return Boolean(OBJ365_TO_CODE[idx]);
};

export const filterAllowedFurnitureCodes = (
  codes: Iterable<FurnitureCategoryCode>
): FurnitureCategoryCode[] => {
  return uniqueCodes(Array.from(codes));
};

export const toFurnitureCategoryCode = (
  raw: string | null | undefined
): FurnitureCategoryCode | null => {
  const normalized = raw?.trim?.().toUpperCase?.() ?? '';
  if (!normalized) return null;
  return FURNITURE_CATEGORY_CODE_SET.has(normalized as FurnitureCategoryCode)
    ? (normalized as FurnitureCategoryCode)
    : null;
};

export const describeObj365Index = (idx?: number | null) => {
  if (typeof idx !== 'number') return 'unknown';
  return OBJ365_ALL_CLASSES[idx] ?? `idx_${idx}`;
};
