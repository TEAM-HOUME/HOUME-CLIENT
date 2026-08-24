import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFilterListQuery } from '@pages/home/apis/queries/useFilterListQuery';
import type { ProductFilterChipCategory } from '@pages/home/types/productTab';
import {
  ALL_FILTER_SENTINEL,
  buildAppliedFilterChips,
  buildFilterMeta,
  buildFurnitureSubCategoryByNameKr,
  isSelectedForRender,
  toDraftFromExternal,
  toExternalFromDraft,
  toggleSectionSelection,
} from '@pages/home/utils/productFilterUtils';
import type {
  ColorFilterOption,
  DraftFilterValues,
  FilterOption,
  FilterSectionKey,
  FilterSummaryMeta,
  ProductFilterValues,
} from '@pages/home/utils/productFilterUtils';

import type { ProductListQueryVariables } from '@constants/queryKey';

/**
 * 필터 기본 적용값
 * - 초기 상태는 섹션별 "전체(ALL 센티널)"을 의미한다.
 */
const INITIAL_FILTER_VALUES: ProductFilterValues = {
  furnitureTypeIds: [ALL_FILTER_SENTINEL],
  priceRangeIds: [ALL_FILTER_SENTINEL],
  colorIds: [ALL_FILTER_SENTINEL],
};

/**
 * 상품 필터 상태 전용 훅
 * - 필터 옵션(API) 로딩
 * - draft/applied 상태 관리
 * - 전체(ALL) 정규화/토글/적용/초기화
 * - 상단 요약 칩/목록 조회 파라미터 생성
 * 을 한 곳에서 관리한다.
 */
const useProductFilterState = () => {
  /** 필터 옵션 원본 API */
  const { data: filterData } = useFilterListQuery();

  /** 실제 적용 중인 값(상단 칩/조회 조건 기준) */
  const [appliedValues, setAppliedValues] = useState<ProductFilterValues>(
    INITIAL_FILTER_VALUES
  );

  /** 바텀시트 내부에서 선택된 값(적용 전) */
  const [draftValues, setDraftValues] = useState<DraftFilterValues>({
    furniture: [ALL_FILTER_SENTINEL],
    price: [ALL_FILTER_SENTINEL],
    color: [ALL_FILTER_SENTINEL],
  });

  /** 가구/가격/색상 섹션 렌더용 옵션 */
  const furnitureOptions = useMemo<FilterOption[]>(
    () =>
      (filterData?.furnitureTypes ?? [])
        .filter((type) => type.id != null && !!type.nameKr)
        .map((type) => ({
          id: String(type.id),
          label: type.nameKr!,
        })),
    [filterData?.furnitureTypes]
  );

  const priceOptions = useMemo<FilterOption[]>(
    () =>
      (filterData?.priceRanges ?? [])
        .filter((range) => range.id != null && !!range.label)
        .map((range) => ({
          id: String(range.id),
          label: range.label!,
        })),
    [filterData?.priceRanges]
  );

  const colorOptions = useMemo<ColorFilterOption[]>(
    () =>
      (filterData?.colors ?? [])
        .filter((color) => color.id != null && !!color.label)
        .map((color) => ({
          id: String(color.id),
          label: color.label!,
          value: color.value ?? undefined,
        })),
    [filterData?.colors]
  );

  /** 상단 요약칩 계산에 사용하는 섹션별 메타(라벨/순서/allId) */
  const furnitureMeta = useMemo<FilterSummaryMeta>(() => {
    return buildFilterMeta(
      (filterData?.furnitureTypes ?? []).map((item) => ({
        id: item.id ?? undefined,
        label: item.nameKr ?? undefined,
      }))
    );
  }, [filterData?.furnitureTypes]);

  const furnitureSubCategoryByNameKr = useMemo(
    () => buildFurnitureSubCategoryByNameKr(filterData?.furnitureTypes ?? []),
    [filterData?.furnitureTypes]
  );

  const priceMeta = useMemo<FilterSummaryMeta>(() => {
    return buildFilterMeta(
      (filterData?.priceRanges ?? []).map((item) => ({
        id: item.id ?? undefined,
        label: item.label ?? undefined,
      }))
    );
  }, [filterData?.priceRanges]);

  const colorMeta = useMemo<FilterSummaryMeta>(() => {
    return buildFilterMeta(
      (filterData?.colors ?? []).map((item) => ({
        id: item.id ?? undefined,
        label: item.label ?? undefined,
      }))
    );
  }, [filterData?.colors]);

  /** 섹션별 서버 "전체" id 묶음 */
  const allIds = useMemo(
    () => ({
      furniture: furnitureMeta.allId,
      price: priceMeta.allId,
      color: colorMeta.allId,
    }),
    [colorMeta.allId, furnitureMeta.allId, priceMeta.allId]
  );

  // allId 확정/변경 시 draft 정규화.
  // 주의(무한루프): allIds 참조 안정 전제(useFilterListQuery staleTime:Infinity). 불안정해지면 setDraftValues가 매 렌더 새 객체 → 루프. 그땐 값 동일 시 set 생략 가드 추가.
  useEffect(() => {
    setDraftValues((prev) =>
      toDraftFromExternal(toExternalFromDraft(prev, allIds), allIds)
    );
  }, [allIds]);

  /** 적용값(applied)을 현재 편집값(draft)으로 복사 */
  const syncDraftFromApplied = useCallback(() => {
    setDraftValues(toDraftFromExternal(appliedValues, allIds));
  }, [allIds, appliedValues]);

  /** 적용된 모든 필터를 비움(섹션별 ALL로 복귀) — 외부로부터 상품 탭에 진입(ResultPage에서 상품 재선택 버튼을 눌러 상품 탭에 진입하는 등)할 때 필터 칩 전부 해제 용도 */
  const clearAllFilters = useCallback(() => {
    setAppliedValues(INITIAL_FILTER_VALUES);
  }, []);

  /** 시트 내부 값만 초기화(섹션별 전체 선택으로 복원) */
  const resetDraft = useCallback(() => {
    setDraftValues({
      furniture: allIds.furniture ? [allIds.furniture] : [ALL_FILTER_SENTINEL],
      price: allIds.price ? [allIds.price] : [ALL_FILTER_SENTINEL],
      color: allIds.color ? [allIds.color] : [ALL_FILTER_SENTINEL],
    });
  }, [allIds.color, allIds.furniture, allIds.price]);

  /** 시트 칩 선택/해제 토글 */
  const toggleDraftChip = useCallback(
    (section: FilterSectionKey, id: string) => {
      setDraftValues((prev) => ({
        ...prev,
        [section]: toggleSectionSelection(prev[section], id, allIds[section]),
      }));
    },
    [allIds]
  );

  /** draft -> applied 확정 */
  const applyDraft = useCallback(() => {
    const nextValues = toExternalFromDraft(draftValues, allIds);
    setAppliedValues(nextValues);
    // 방금 적용한 값을 반환 — setState 직후 appliedValues는 stale이라, 호출부(GA submit 등)가 최신 값을 쓰도록
    return {
      appliedValues: nextValues,
      appliedFilterChips: buildAppliedFilterChips(
        nextValues,
        furnitureMeta,
        priceMeta,
        colorMeta
      ),
    };
  }, [allIds, draftValues, furnitureMeta, priceMeta, colorMeta]);

  /** 상단 적용칩 X 클릭 시 해당 카테고리만 전체로 복귀 */
  const removeAppliedChip = useCallback(
    (category: ProductFilterChipCategory) => {
      setAppliedValues((prev) => ({
        furnitureTypeIds:
          category === 'furniture'
            ? [ALL_FILTER_SENTINEL]
            : prev.furnitureTypeIds,
        priceRangeIds:
          category === 'price' ? [ALL_FILTER_SENTINEL] : prev.priceRangeIds,
        colorIds: category === 'color' ? [ALL_FILTER_SENTINEL] : prev.colorIds,
      }));
    },
    []
  );

  /** SearchSection 상단에 표시할 적용칩(파생값) */
  const appliedFilterChips = useMemo(
    () =>
      buildAppliedFilterChips(
        appliedValues,
        furnitureMeta,
        priceMeta,
        colorMeta
      ),
    [appliedValues, colorMeta, furnitureMeta, priceMeta]
  );

  /** 현재 draft 기준 칩 selected 여부 계산 */
  const isChipSelected = useCallback(
    (section: FilterSectionKey, id: string) => {
      return isSelectedForRender(draftValues[section], id, allIds[section]);
    },
    [allIds, draftValues]
  );

  /** 적용 필터를 상품 목록 API 쿼리 파라미터 형태로 변환 */
  const productListQueryParams: ProductListQueryVariables = useMemo(() => {
    const parseNumberIds = (ids: string[]): number[] => {
      return ids
        .filter((id) => id !== ALL_FILTER_SENTINEL)
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
    };

    const types = parseNumberIds(appliedValues.furnitureTypeIds);
    const colors = parseNumberIds(appliedValues.colorIds);
    const priceRanges = appliedValues.priceRangeIds.filter(
      (id) => id !== ALL_FILTER_SENTINEL
    );

    return {
      types: types.length > 0 ? types : undefined,
      colors: colors.length > 0 ? colors : undefined,
      priceRanges: priceRanges.length > 0 ? priceRanges : undefined,
    };
  }, [
    appliedValues.colorIds,
    appliedValues.furnitureTypeIds,
    appliedValues.priceRangeIds,
  ]);

  /** ProductTabController에서 사용할 값 */
  return {
    furnitureOptions,
    priceOptions,
    colorOptions,
    appliedFilterChips,
    appliedValues,
    furnitureLabels: furnitureMeta.labels,
    furnitureSubCategoryByNameKr,
    priceLabels: priceMeta.labels,
    colorLabels: colorMeta.labels,
    syncDraftFromApplied,
    resetDraft,
    clearAllFilters,
    toggleDraftChip,
    applyDraft,
    removeAppliedChip,
    isChipSelected,
    productListQueryParams,
  };
};

export { useProductFilterState };
export type { ProductFilterValues };
