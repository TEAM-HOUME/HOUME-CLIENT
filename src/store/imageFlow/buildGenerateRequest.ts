import type {
  BannerGenerateImageRequest,
  GenerateImageV4Request,
  OtherStyleGenerateImageRequest,
  ProductGenerateImageRequest,
} from '@apis/__generated__/data-contracts';

import type { ImageFlow } from './flowConfig';

// 퍼널에서 사용자가 입력한 값. sessionStorage에 저장돼 값이 망가질 수 있어 필드마다 검사한다
export interface FunnelData {
  floorPlan: unknown;
  moodBoardIds: unknown;
  activityInfo: { activity?: string; furnitureIds?: number[] } | null;
}

/**
 * 생성 요청을 만들지 못한 이유
 *
 * 이 값이 없으면 "생성 버튼을 눌렀는데 홈으로 튕겼다"의 원인을 알 수 없다.
 * 서버 입장에서는 요청이 오지 않았으므로 서버 로그에도 흔적이 없다.
 * LoadingPage가 이 값을 Sentry fingerprint로 써서 원인별로 이슈를 나눈다.
 */
export const GENERATE_INVALID_REASON = {
  /** 진입 경로 정보가 사라짐 (sessionStorage 유실) */
  NO_FLOW: 'noFlow',
  /** 도면 값이 손상됨 — 모든 경로에 필수 */
  INVALID_FLOOR_PLAN: 'invalidFloorPlan',
  /** 풀퍼널 — 무드보드 선택값이 손상됨 */
  INVALID_MOOD_BOARD_IDS: 'invalidMoodBoardIds',
  /** 풀퍼널 — 주요활동 선택값이 손상됨 */
  INVALID_ACTIVITY: 'invalidActivity',
  /** 풀퍼널 — 가구 선택값이 손상됨 */
  INVALID_FURNITURE_IDS: 'invalidFurnitureIds',
  /** 배너 경로 — bannerId/answerId가 손상됨 */
  INVALID_BANNER_REF: 'invalidBannerRef',
  /** 스타일 경로 — styleId가 손상됨 */
  INVALID_STYLE_REF: 'invalidStyleRef',
  /** 상품 경로 — productIds가 손상됐거나 개수가 1~6 범위를 벗어남 */
  INVALID_PRODUCT_IDS: 'invalidProductIds',
  /** 알 수 없는 route가 복원됨 (컴파일 타임엔 도달 불가) */
  UNKNOWN_ROUTE: 'unknownRoute',
} as const;

export type GenerateInvalidReason =
  (typeof GENERATE_INVALID_REASON)[keyof typeof GENERATE_INVALID_REASON];

// 어떤 이미지 생성 API를 어떤 payload로 부를지 담은 결과 (실제 mutate 연결은 훅에서 함)
export type GenerateRequestPlan =
  | { kind: 'fullFunnel'; payload: GenerateImageV4Request }
  | { kind: 'banner'; payload: BannerGenerateImageRequest }
  | { kind: 'otherStyle'; payload: OtherStyleGenerateImageRequest }
  | { kind: 'product'; payload: ProductGenerateImageRequest }
  | {
      kind: 'invalid';
      reason: GenerateInvalidReason;
      /** 어느 진입 경로에서 실패했는지. flow 자체가 없으면 null */
      route: ImageFlow['route'] | null;
    };

const isFloorPlanValid = (
  floorPlan: unknown
): floorPlan is {
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
} => {
  if (!floorPlan || typeof floorPlan !== 'object') return false;
  const f = floorPlan as Record<string, unknown>;
  return (
    Number.isInteger(f['floorPlanId']) &&
    typeof f['floorPlanView'] === 'string' &&
    typeof f['isMirror'] === 'boolean'
  );
};

const isIntegerArray = (arr: unknown): arr is number[] =>
  Array.isArray(arr) && arr.every((n) => Number.isInteger(n));

/**
 * flow와 퍼널 입력값을 받아 '어떤 생성 요청을 보낼지'를 계산한다(순수 함수).
 * flow가 없거나 값이 부족하면 invalid.
 * 종류는 route로 정해진다 — GENERATE_BUTTON/FLOOR_PLAN만 풀퍼널.
 */
export const buildGenerateRequest = (
  flow: ImageFlow | null,
  funnel: FunnelData
): GenerateRequestPlan => {
  if (!flow) {
    return {
      kind: 'invalid',
      reason: GENERATE_INVALID_REASON.NO_FLOW,
      route: null,
    };
  }

  const { floorPlan, moodBoardIds, activityInfo } = funnel;
  // 이 아래로는 route가 확정돼 있으므로 invalid에 매번 같이 담는다
  const invalid = (reason: GenerateInvalidReason): GenerateRequestPlan => ({
    kind: 'invalid',
    reason,
    route: flow.route,
  });

  // 도면(floorPlan)은 모든 생성 요청에 반드시 필요
  if (!isFloorPlanValid(floorPlan)) {
    return invalid(GENERATE_INVALID_REASON.INVALID_FLOOR_PLAN);
  }

  switch (flow.route) {
    case 'GENERATE_BUTTON':
    case 'FLOOR_PLAN': {
      const activity = activityInfo?.activity;
      const furnitureIds = activityInfo?.furnitureIds;
      // 세 값을 따로 판별한다 — 어느 스텝의 입력이 사라졌는지 알아야 원인 추적이 된다
      if (!isIntegerArray(moodBoardIds)) {
        return invalid(GENERATE_INVALID_REASON.INVALID_MOOD_BOARD_IDS);
      }
      if (typeof activity !== 'string') {
        return invalid(GENERATE_INVALID_REASON.INVALID_ACTIVITY);
      }
      if (!isIntegerArray(furnitureIds)) {
        return invalid(GENERATE_INVALID_REASON.INVALID_FURNITURE_IDS);
      }
      return {
        kind: 'fullFunnel',
        payload: {
          floorPlanId: floorPlan.floorPlanId,
          floorPlanView: floorPlan.floorPlanView,
          isMirror: floorPlan.isMirror,
          moodBoardIds,
          activity,
          furnitureIds,
        },
      };
    }
    case 'HOME_BANNER': {
      if (
        !Number.isInteger(flow.bannerId) ||
        !Number.isInteger(flow.answerId)
      ) {
        return invalid(GENERATE_INVALID_REASON.INVALID_BANNER_REF);
      }
      return {
        kind: 'banner',
        payload: {
          bannerId: flow.bannerId,
          answerId: flow.answerId,
          floorPlanId: floorPlan.floorPlanId,
          floorPlanView: floorPlan.floorPlanView,
          isMirror: floorPlan.isMirror,
        },
      };
    }
    case 'STYLE_RESTYLE': {
      if (!Number.isInteger(flow.styleId)) {
        return invalid(GENERATE_INVALID_REASON.INVALID_STYLE_REF);
      }
      return {
        kind: 'otherStyle',
        payload: {
          // 주의: swagger 명세에서 request 필드명이 styleId가 아니라 bannerId
          bannerId: flow.styleId,
          floorPlanId: floorPlan.floorPlanId,
          floorPlanView: floorPlan.floorPlanView,
          isMirror: floorPlan.isMirror,
        },
      };
    }
    case 'PRODUCT_SELECTION': {
      if (
        !isIntegerArray(flow.productIds) ||
        flow.productIds.length < 1 ||
        flow.productIds.length > 6
      ) {
        return invalid(GENERATE_INVALID_REASON.INVALID_PRODUCT_IDS);
      }
      return {
        kind: 'product',
        payload: {
          floorPlanId: floorPlan.floorPlanId,
          floorPlanView: floorPlan.floorPlanView,
          isMirror: floorPlan.isMirror,
          productIds: flow.productIds,
        },
      };
    }
    default:
      // sessionStorage 손상 등으로 알 수 없는 route가 복원된 경우 방어 (컴파일 타임엔 도달 불가)
      return invalid(GENERATE_INVALID_REASON.UNKNOWN_ROUTE);
  }
};
