// 정적 구조 ✅ / 런타임 위치 / 런타임 데이터 / 전이

// 이미지 생성 플로우의 정적 도메인 값(진입 경로·결과 타입·상품 아이템)
// 런타임 스토어(useImageFlowStore)와 정적 설정(flowConfig)이 모두 여기에 의존한다.

// 이미지 생성 플로우 종류 (5가지), 실제 이미지 생성 플로우 종류
export type FlowRoute =
  | 'GENERATE_BUTTON'
  | 'FLOOR_PLAN'
  | 'HOME_BANNER'
  | 'STYLE_RESTYLE'
  | 'PRODUCT_SELECTION';

// 진입 경로별 정적 구성
// 이 경로면 어떤 스텝을 거치고, 어떤 이미지 생성 API를 호출하며, 어떤 결과화면(목록형/추천형)을 띄우는가
export interface FlowConfig {
  // FloorPlanSelect 스텝 완료 후 다음 목적지 (기존 getNextFunnelStep 대체)
  // INTERIOR_STYLE: 풀퍼널(다음 스텝으로 이동), GENERATE: 숏퍼널(바로 /generate)
  afterFloorPlan: 'INTERIOR_STYLE' | 'GENERATE';
  // 이미지 생성 요청 종류 — S2의 buildGenerateRequest가 사용 (기존 preset.type switch 대체)
  requestKind: 'fullFunnel' | 'banner' | 'otherStyle' | 'product';
  // 결과 페이지 viewType (기존 RESULT_TYPE_MAP + 저장 resultType 대체)
  resultView: ResultType;
}

// 이미지 생성 퍼널 진입 경로 (6가지), GA 이벤트용 종류
// 같은 상품으로 이미지 재생성(PRODUCT_REGENERATE)은 상품으로 이미지 생성(PRODUCT_SELECTION)과 완전히 동일한 플로우, 따라서 FlowRoute에서는 구분 X
// GA 이벤트 분리를 위해 ENTRY_ROUTE에서는 둘을 분리함
export const ENTRY_ROUTE = {
  GENERATE_BUTTON: 'GENERATE_BUTTON', // 경로1: 상단 "이미지 생성" 버튼
  HOME_BANNER: 'HOME_BANNER', // 경로2: 홈 배너 슬라이드
  FLOOR_PLAN: 'FLOOR_PLAN', // 경로3: "우리 집 공간으로 시작하기" 도면 클릭
  STYLE_RESTYLE: 'STYLE_RESTYLE', // 경로4: "다른 스타일로 꾸며보기"
  PRODUCT_SELECTION: 'PRODUCT_SELECTION', // 경로5-1: "상품" 탭 담기 → CTA
  PRODUCT_REGENERATE: 'PRODUCT_REGENERATE', // 경로5-2: 결과페이지 → "상품 다시 선택하기" → 상품 탭 → CTA
} as const;

export type EntryRoute = (typeof ENTRY_ROUTE)[keyof typeof ENTRY_ROUTE];

// 결과 페이지 viewType (서버 응답 viewType과 값 통일)
// 서버 응답의 'LEGACY'는 enum에서 제외 (isCurationViewType 헬퍼에서 추천형으로 처리)
export const RESULT_TYPE = {
  BANNER: 'BANNER',
  FULL_FUNNEL: 'FULL_FUNNEL',
  STYLE: 'STYLE',
  PRODUCT: 'PRODUCT',
} as const;

export type ResultType = (typeof RESULT_TYPE)[keyof typeof RESULT_TYPE];

// 상품 탭 UI 복원에 사용하는 상품 스냅샷
// productIds는 상품 이미지 생성 API payload용, productsToBeRestored는 외부(로그인게이트/ResultPage)에서 ProductTab 진입 시 사용
export interface ProductItem {
  id: number;
  title: string;
  brand: string;
  imageUrl?: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
}
