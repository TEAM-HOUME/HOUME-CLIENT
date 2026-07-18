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
  // 도면 선택 다음: INTERIOR_STYLE(다음 스텝) 또는 GENERATE(바로 이미지 생성)
  afterFloorPlan: 'INTERIOR_STYLE' | 'GENERATE';
  // 어떤 이미지 생성 API를 부를지
  requestKind: 'fullFunnel' | 'banner' | 'otherStyle' | 'product';
  // 결과 페이지에서 보여줄 화면 종류
  resultView: ResultType;
}

// 플로우가 지금 퍼널 안이냐 밖이냐
// - funnel: /imageSetup에서 진행 중
// - postFunnel: 퍼널을 빠져나온 뒤 (ResultPage·GA가 이 값 사용)
export type FlowPhase = 'funnel' | 'postFunnel';

// 지금 진행 중인 플로우에 필요한 값: 종류(route) + 상태(phase) + 퍼널 진입 전 preset
// +) 퍼널 스텝 안에서 사용자가 고르는 값(도면 최종 선택·무드보드·활동)은 여기 없고 useFunnelStore에 있음
// 한 번 쓰고 버리는 값(도면 id·복원용 상품)은 사용 후 null로 비운다.
export type ImageFlow =
  | { route: 'GENERATE_BUTTON'; phase: FlowPhase }
  | { route: 'FLOOR_PLAN'; phase: FlowPhase; presetFloorPlanId: number | null } // null = 홈에서 '더보기'로 도면 페이지 진입 또는 다 씀
  | {
      route: 'HOME_BANNER';
      phase: FlowPhase;
      bannerId: number;
      answerId: number;
    }
  | { route: 'STYLE_RESTYLE'; phase: FlowPhase; styleId: number }
  | {
      route: 'PRODUCT_SELECTION';
      phase: FlowPhase;
      isRegenerate: boolean; // 결과에서 "다시 선택하기"로 온 경우 true (GA만 SHOP_REGENERATE로 구분)
      productIds: number[];
      productsToBeRestored: ProductItem[] | null; // null = 복원 다 씀 또는 생성 완료 후 비움
    };

// useImageFlowStore의 startFlow가 받는 값. ImageFlow에서 phase만 뺀 형태 —
// 시작할 땐 phase가 항상 funnel이라 startFlow에서 알아서 넣는다.
export type StartFlowInput =
  | { route: 'GENERATE_BUTTON' }
  | { route: 'FLOOR_PLAN'; presetFloorPlanId?: number }
  | { route: 'HOME_BANNER'; bannerId: number; answerId: number }
  | { route: 'STYLE_RESTYLE'; styleId: number }
  | {
      route: 'PRODUCT_SELECTION';
      isRegenerate: boolean;
      productIds: number[];
      productsToBeRestored: ProductItem[];
    };

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
