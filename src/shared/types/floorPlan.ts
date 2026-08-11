// (@apis/__generated__/data-contracts)
//   - ExploreHouseTemplateListResponse: 도면 전체 조회
//   - ExploreHouseTemplateDetailResponse: 도면 상세 조회 (다중 뷰)
// 최근 도면 (RecentFloorPlanResponse)은 swagger spec 미반영 상태라 추후 추가

// --- 필터 관련 타입 (클라이언트 전용) ---

// 각 FilterCategory의 하위 선택지
export interface FilterOption {
  id: string;
  label: string;
}

// ex: 주거 형태, 구조, 평형
export interface FilterCategory {
  /**
   * FloorPlanFilters의 key('residenceType' | 'layoutType' | 'equilibrium')로 제한.
   * appliedFilters[category.id]처럼 필터 객체 키로 직접 사용되므로,
   * 임의의 문자열이 키로 들어오는 것을 방지하고
   * 사용처에서 `as keyof FloorPlanFilters` 단언 없이 타입 안전하게 접근하기 위함.
   */
  id: keyof FloorPlanFilters;
  label: string;
  options: FilterOption[];
}

// 현재 적용된 필터 상태 (swagger 쿼리 파라미터 이름과 통일)
export interface FloorPlanFilters {
  residenceType: string[];
  layoutType: string[];
  equilibrium: string[];
}

// 필터 초기값
export const DEFAULT_FILTERS: FloorPlanFilters = {
  residenceType: [],
  layoutType: [],
  equilibrium: [],
};
