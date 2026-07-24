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

// 어떤 이미지 생성 API를 어떤 payload로 부를지 담은 결과 (실제 mutate 연결은 훅에서 함)
export type GenerateRequestPlan =
  | { kind: 'fullFunnel'; payload: GenerateImageV4Request }
  | { kind: 'banner'; payload: BannerGenerateImageRequest }
  | { kind: 'otherStyle'; payload: OtherStyleGenerateImageRequest }
  | { kind: 'product'; payload: ProductGenerateImageRequest }
  | { kind: 'invalid' };

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
    Number.isInteger(f.floorPlanId) &&
    typeof f.floorPlanView === 'string' &&
    typeof f.isMirror === 'boolean'
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
  if (!flow) return { kind: 'invalid' };

  const { floorPlan, moodBoardIds, activityInfo } = funnel;

  // 도면(floorPlan)은 모든 생성 요청에 반드시 필요
  if (!isFloorPlanValid(floorPlan)) return { kind: 'invalid' };

  switch (flow.route) {
    case 'GENERATE_BUTTON':
    case 'FLOOR_PLAN': {
      const activity = activityInfo?.activity;
      const furnitureIds = activityInfo?.furnitureIds;
      if (
        !isIntegerArray(moodBoardIds) ||
        typeof activity !== 'string' ||
        !isIntegerArray(furnitureIds)
      ) {
        return { kind: 'invalid' };
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
        return { kind: 'invalid' };
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
      if (!Number.isInteger(flow.styleId)) return { kind: 'invalid' };
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
        return { kind: 'invalid' };
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
      return { kind: 'invalid' };
  }
};
