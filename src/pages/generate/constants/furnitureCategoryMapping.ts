import { OBJ365_ALL_CLASSES } from '../utils/obj365AllClasses';
import {
  isCabinetShelfIndex,
  OBJ365_FURNITURE_INDEX_SET,
} from '../utils/obj365Furniture';

import type { CabinetRefinementCategory } from '../utils/cabinetRefinementCategories';

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

// 모델 최종 라벨을 12개 코드로 단일화하는 매핑(정리본 기반, 불필요 단어 제거)
const defineLabelMap = (): Record<string, FurnitureCategoryCode[]> => {
  const entries: Array<[string, FurnitureCategoryCode[]]> = [
    ['Cabinet/shelf', ['DISPLAY_CABINET']], // 12번 OBJ365 'Cabinet/shelf' 기본값 리파인 실패 시 사용
    // ['Chair', ['SINGLE_SOFA']], // 2번 OBJ365 'Chair' 비활성화
    ['Desk', ['OFFICE_DESK']], // 9번 OBJ365 'Desk'
    ['Storage box', ['DRAWER']], // 20번 OBJ365 'Storage box'
    // ['Bench', ['SINGLE_SOFA']], // 24번 OBJ365 'Bench' 비활성화
    ['Monitor/TV', ['MOVABLE_TV']], // 37번 OBJ365 'Monitor/TV'
    // ['Stool', ['SINGLE_SOFA']], // 47번 OBJ365 'Stool' 비활성화
    ['Couch', ['TWO_SEATER_SOFA']], // 50번 OBJ365 'Couch'
    ['Bed', ['SINGLE']], // 75번 OBJ365 'Bed'
    ['Mirror', ['MIRROR']], // 79번 OBJ365 'Mirror'
    ['Dining Table', ['DINING_TABLE']], // 98번 OBJ365 'Dining Table'
    ['Coffee Table', ['SITTING_TABLE']], // 167번 OBJ365 'Coffee Table'
    ['Side Table', ['SITTING_TABLE']], // 168번 OBJ365 'Side Table'
    // ['Nightstand', ['DRAWER']], // 121 (미지원 가구로 비활성화)
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
  // 2: ['SINGLE_SOFA'], // OBJ365 'Chair' 비활성화
  9: ['OFFICE_DESK'], // OBJ365 'Desk'
  12: ['DISPLAY_CABINET'], // OBJ365 'Cabinet/shelf'
  20: ['DRAWER'], // OBJ365 'Storage box'
  // 24: ['SINGLE_SOFA'], // OBJ365 'Bench' 비활성화
  37: ['MOVABLE_TV'], // OBJ365 'Monitor/TV'
  // 47: ['SINGLE_SOFA'], // OBJ365 'Stool' 비활성화
  50: ['TWO_SEATER_SOFA'], // OBJ365 'Couch'
  75: ['SINGLE'], // OBJ365 'Bed'
  79: ['MIRROR'], // OBJ365 'Mirror'
  98: ['DINING_TABLE'], // OBJ365 'Dining Table'
  167: ['SITTING_TABLE'], // OBJ365 'Coffee Table'
  168: ['SITTING_TABLE'], // OBJ365 'Side Table'
  // 121: ['DRAWER'], // Nightstand 미지원으로 비활성화
} as const;

// cabinet 2차 분류 결과 → 12개 코드 매핑
const CABINET_CATEGORY_TO_CODE: Partial<
  Record<CabinetRefinementCategory, FurnitureCategoryCode>
> = {
  lowerCabinet: 'DISPLAY_CABINET',
  // upperCabinet: 'WHITE_BOOKSHELF', // 상부장(upperCabinet)은 2차 cabinet 분류에서 추론 비활성 처리
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
  refined: CabinetRefinementCategory | undefined
): FurnitureCategoryCode | null => {
  if (!refined) return null;
  return CABINET_CATEGORY_TO_CODE[refined] ?? null;
};

export const resolveFurnitureCodes = (input: {
  finalLabel?: string | null;
  obj365Label?: number | null;
  refinedLabel?: CabinetRefinementCategory;
  refinedConfidence?: number;
}): FurnitureCategoryCode[] => {
  const code = resolveFurnitureCode(input);
  return code ? [code] : [];
};

export const resolveFurnitureCode = (input: {
  finalLabel?: string | null;
  obj365Label?: number | null;
  refinedLabel?: CabinetRefinementCategory;
  refinedConfidence?: number;
}): FurnitureCategoryCode | null => {
  // Cabinet/shelf 인데 2차 리파인 결과가 없으면 감지 실패로 간주
  if (isCabinetShelfIndex(input.obj365Label) && !input.refinedLabel) {
    return null;
  }

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
