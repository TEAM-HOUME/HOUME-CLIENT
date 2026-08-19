import type {
  AppliedFilterChip,
  SelectedProduct,
} from '@pages/home/types/productTab';

import type { FurnitureTypeFilterResponse } from '@apis/__generated__/data-contracts';

/** 외부(탭 상태/요청 파라미터)와 내부(시트 선택 상태)를 연결할 때 사용하는 표준 "전체" 센티널 값 */
const ALL_FILTER_SENTINEL = 'ALL';

/** 필터 시트에서 다루는 섹션 키 집합 */
type FilterSectionKey = 'furniture' | 'price' | 'color';

/** 외부 계약값: ProductTab/useProductFilters가 다루는 적용 필터 값 */
interface ProductFilterValues {
  furnitureTypeIds: string[];
  priceRangeIds: string[];
  colorIds: string[];
}

/** 내부 draft 상태: 시트에서 사용자가 현재 선택 중인 값(적용 전) */
type DraftFilterValues = Record<FilterSectionKey, string[]>;

/** 칩 렌더를 위한 최소 옵션 타입 */
interface FilterOption {
  id: string;
  label: string;
}

interface ColorFilterOption extends FilterOption {
  value?: string;
}

/** 상단 요약칩("식탁 외 N개") 계산을 위한 메타 데이터 */
interface FilterSummaryMeta {
  labels: Record<string, string>;
  orderedOptionIds: string[];
  allId?: string;
}

/**
 * API 응답 옵션 배열을 요약 계산용 메타로 변환한다.
 * - labels: id -> 라벨 맵
 * - orderedOptionIds: 대표 라벨 선택 시 우선순위가 되는 원본 순서
 * - allId: 서버가 내려준 "전체" 옵션의 실제 id
 */
const buildFilterMeta = (
  options: Array<{ id?: string | number; label?: string }>
): FilterSummaryMeta => {
  const labels = Object.fromEntries(
    options
      .filter((item) => item.id != null && !!item.label)
      .map((item) => [String(item.id), item.label!])
  );
  const orderedOptionIds = options
    .filter((item) => item.id != null)
    .map((item) => String(item.id));
  const allId = options.find((item) => item.label === '전체')?.id;

  return {
    labels,
    orderedOptionIds,
    allId: allId != null ? String(allId) : undefined,
  };
};

/**
 * 외부/초기값을 시트 내부 선택 상태로 정규화한다.
 * - allId가 있으면 비어있는 선택도 전체 선택으로 강제한다.
 * - 센티널(ALL)과 실제 allId를 혼용해도 내부에선 실제 allId 기준으로 유지한다.
 */
const normalizeInternalSelection = (
  ids: string[],
  allId?: string
): string[] => {
  if (!allId) return ids.filter((id) => id !== ALL_FILTER_SENTINEL);
  if (ids.length === 0) return [allId];
  if (ids.length === 1 && ids[0] === ALL_FILTER_SENTINEL) return [allId];

  const sanitized = ids.filter((id) => id !== ALL_FILTER_SENTINEL);
  return sanitized.length === 0 ? [allId] : sanitized;
};

/**
 * 시트 내부 선택 상태를 외부 계약값으로 변환한다.
 * - 내부에서 전체가 선택된 상태([allId])는 외부에서 [ALL]로 통일한다.
 * - 외부에서는 센티널 기반으로 "선택 없음(=전체)" 의미를 일관되게 다룬다.
 */
const toExternalSelection = (ids: string[], allId?: string): string[] => {
  if (
    allId &&
    ids.length === 1 &&
    (ids[0] === allId || ids[0] === ALL_FILTER_SENTINEL)
  ) {
    return [ALL_FILTER_SENTINEL];
  }

  return ids.filter((id) => id !== ALL_FILTER_SENTINEL);
};

/**
 * 섹션 칩 토글 규칙
 * - 전체(allId) 클릭 시 전체 단일 선택으로 전환
 * - 일반 칩 클릭 시 전체 해제 후 다중 선택 토글
 * - 일반 칩이 모두 해제되면 자동으로 전체 선택으로 복귀
 */
const toggleSectionSelection = (
  current: string[],
  id: string,
  allId?: string
): string[] => {
  const normalizedCurrent = current.filter((x) => x !== ALL_FILTER_SENTINEL);

  if (!allId) {
    const has = normalizedCurrent.includes(id);
    return has
      ? normalizedCurrent.filter((x) => x !== id)
      : [...normalizedCurrent, id];
  }

  if (id === allId) return [allId];

  const withoutAll = normalizedCurrent.filter((x) => x !== allId);
  const has = withoutAll.includes(id);
  const next = has ? withoutAll.filter((x) => x !== id) : [...withoutAll, id];
  return next.length === 0 ? [allId] : next;
};

/**
 * 렌더 시 칩의 selected 여부를 계산한다.
 * - 내부 상태가 allId 대신 센티널(ALL)을 잠깐 갖는 과도기에도
 *   "전체" 칩이 선택된 것으로 보이도록 보정한다.
 */
const isSelectedForRender = (
  ids: string[],
  chipId: string,
  allId?: string
): boolean => {
  if (ids.includes(chipId)) return true;
  return !!allId && chipId === allId && ids.includes(ALL_FILTER_SENTINEL);
};

/**
 * 외부 적용값 -> 시트 내부 draft 상태
 * - 탭에서 저장된 적용값을 시트 열 때 복원할 때 사용한다.
 */
const toDraftFromExternal = (
  values: ProductFilterValues,
  allIds: Record<FilterSectionKey, string | undefined>
): DraftFilterValues => {
  return {
    furniture: normalizeInternalSelection(
      values.furnitureTypeIds,
      allIds.furniture
    ),
    price: normalizeInternalSelection(values.priceRangeIds, allIds.price),
    color: normalizeInternalSelection(values.colorIds, allIds.color),
  };
};

/**
 * 시트 내부 draft 상태 -> 외부 적용값
 * - "필터 적용하기" 시점에 실제 적용값으로 확정할 때 사용한다.
 */
const toExternalFromDraft = (
  values: DraftFilterValues,
  allIds: Record<FilterSectionKey, string | undefined>
): ProductFilterValues => {
  return {
    furnitureTypeIds: toExternalSelection(values.furniture, allIds.furniture),
    priceRangeIds: toExternalSelection(values.price, allIds.price),
    colorIds: toExternalSelection(values.color, allIds.color),
  };
};

/**
 * 선택값을 "대표 라벨 + 외 N개" 형태로 요약한다.
 * - 대표 라벨은 API 원본 순서(orderedOptionIds) 우선으로 선택한다.
 */
const buildSummaryLabel = (
  ids: string[],
  meta: FilterSummaryMeta
): string | null => {
  const selected = ids.filter(
    (id) => id !== ALL_FILTER_SENTINEL && id !== meta.allId
  );
  if (selected.length === 0) return null;

  const selectedSet = new Set(selected);
  const [fallbackId] = selected;
  const firstId =
    meta.orderedOptionIds.find(
      (id) =>
        id !== ALL_FILTER_SENTINEL && id !== meta.allId && selectedSet.has(id)
    ) ?? fallbackId;

  // 위에서 selected.length === 0을 걸렀으므로 여기 도달하면 firstId는 항상 있다
  if (!firstId) return null;

  const first = meta.labels[firstId] ?? firstId;
  return selected.length === 1 ? first : `${first} 외 ${selected.length - 1}개`;
};

/**
 * SearchSection 상단의 3개 칩(카테고리/가격대/색상) 표시용 모델 생성
 * - applied=false: placeholder(예: 카테고리)
 * - applied=true: 요약 라벨(예: 식탁 외 2개)
 */
const buildAppliedFilterChips = (
  values: ProductFilterValues,
  furnitureMeta: FilterSummaryMeta,
  priceMeta: FilterSummaryMeta,
  colorMeta: FilterSummaryMeta
): AppliedFilterChip[] => {
  const furnitureLabel = buildSummaryLabel(
    values.furnitureTypeIds,
    furnitureMeta
  );
  const priceLabel = buildSummaryLabel(values.priceRangeIds, priceMeta);
  const colorLabel = buildSummaryLabel(values.colorIds, colorMeta);

  return [
    {
      category: 'furniture',
      id: furnitureLabel ? 'furniture-summary' : 'furniture-placeholder',
      label: furnitureLabel ?? '카테고리',
      applied: furnitureLabel !== null,
    },
    {
      category: 'price',
      id: priceLabel ? 'price-summary' : 'price-placeholder',
      label: priceLabel ?? '가격대',
      applied: priceLabel !== null,
    },
    {
      category: 'color',
      id: colorLabel ? 'color-summary' : 'color-placeholder',
      label: colorLabel ?? '색상',
      applied: colorLabel !== null,
    },
  ];
};

const LEGACY_CATEGORY_SUB_CATEGORY: Record<string, string> = {
  '그 외': 'ETC',
};

/** 필터 API 로드 전에도 product_sub_category를 채우기 위한 기본 매핑 */
const DEFAULT_FURNITURE_SUB_CATEGORY_BY_NAME_KR: Record<string, string> = {
  ...LEGACY_CATEGORY_SUB_CATEGORY,
  기타: 'ETC',
  '침대/프레임': 'BED',
  '업무용 책상': 'OFFICE_DESK',
  식탁: 'DINING_TABLE',
  '좌식 테이블': 'SITTING_TABLE',
  옷장: 'CLOSET',
  '수납/장식장': 'DISPLAY_CABINET',
  소파: 'SOFA',
  '의자/스툴': 'CHAIR',
  '화장대/협탁': 'DRESSING_TABLE',
  조명: 'LIGHTING',
};

export const buildFurnitureSubCategoryByNameKr = (
  furnitureTypes: Pick<FurnitureTypeFilterResponse, 'nameKr' | 'nameEng'>[] = []
) => {
  const map: Record<string, string> = {
    ...DEFAULT_FURNITURE_SUB_CATEGORY_BY_NAME_KR,
  };

  furnitureTypes.forEach((type) => {
    if (type.nameKr && type.nameEng) {
      map[type.nameKr] = type.nameEng;
    }
  });

  return map;
};

export const resolveProductSubCategoryName = (
  categoryName: string | undefined,
  subCategoryByNameKr: Record<string, string>
) => (categoryName ? subCategoryByNameKr[categoryName] : undefined);

export const withProductSubCategory = (
  product: SelectedProduct,
  subCategoryByNameKr: Record<string, string>
): SelectedProduct => ({
  ...product,
  subCategoryName:
    product.subCategoryName ??
    resolveProductSubCategoryName(product.categoryName, subCategoryByNameKr),
});

export {
  ALL_FILTER_SENTINEL,
  buildAppliedFilterChips,
  buildFilterMeta,
  isSelectedForRender,
  normalizeInternalSelection,
  toDraftFromExternal,
  toExternalFromDraft,
  toggleSectionSelection,
};
export type {
  ColorFilterOption,
  DraftFilterValues,
  FilterOption,
  FilterSectionKey,
  FilterSummaryMeta,
  ProductFilterValues,
};
