// 정적 구조 ✅ / 런타임 위치 / 런타임 데이터 / 전이

import {
  ENTRY_ROUTE,
  RESULT_TYPE,
  type EntryRoute,
  type FlowConfig,
  type FlowRoute,
  type ImageFlow,
} from './types';

// 이미지 생성 플로우의 정적 구조 선언 — '진입 경로 X일 때 무엇이 일어나는가' SSOT
/**
 * afterFloorPlan: 도면 선택 다음 스텝
 * requestKind: 이미지 생성 요청 API 종류
 * resultView: 어떤 FlowRoute로부터 생성된 이미지인지
 */
export const FLOW_CONFIG: Record<FlowRoute, FlowConfig> = {
  GENERATE_BUTTON: {
    afterFloorPlan: 'INTERIOR_STYLE',
    requestKind: 'fullFunnel',
    resultView: RESULT_TYPE.FULL_FUNNEL,
  },
  FLOOR_PLAN: {
    afterFloorPlan: 'INTERIOR_STYLE',
    requestKind: 'fullFunnel',
    resultView: RESULT_TYPE.FULL_FUNNEL,
  },
  HOME_BANNER: {
    afterFloorPlan: 'GENERATE',
    requestKind: 'banner',
    resultView: RESULT_TYPE.BANNER,
  },
  STYLE_RESTYLE: {
    afterFloorPlan: 'GENERATE',
    requestKind: 'otherStyle',
    resultView: RESULT_TYPE.STYLE,
  },
  PRODUCT_SELECTION: {
    afterFloorPlan: 'GENERATE',
    requestKind: 'product',
    resultView: RESULT_TYPE.PRODUCT, // 목록형 결과에 '상품 다시 선택하기' 버튼을 띄움
  },
};

// flow → GA에서 쓰는 EntryRoute(6개)로 변환.
// 상품 재선택(isRegenerate)만 PRODUCT_REGENERATE로 나뉘고, 나머지는 route를 그대로 쓴다.
export const flowToEntryRoute = (flow: ImageFlow | null): EntryRoute | null => {
  if (!flow) return null;
  if (flow.route === 'PRODUCT_SELECTION' && flow.isRegenerate) {
    return ENTRY_ROUTE.PRODUCT_REGENERATE;
  }
  return flow.route;
};

// viewType이 추천형(큐레이션)인지 판단하는 헬퍼 (기존 useImageFlowStore에서 이동).
// 서버 응답의 'LEGACY' 및 그 외 값은 추천형으로 처리
export const isCurationViewType = (viewType: string | null | undefined) =>
  viewType !== RESULT_TYPE.BANNER &&
  viewType !== RESULT_TYPE.STYLE &&
  viewType !== RESULT_TYPE.PRODUCT;
