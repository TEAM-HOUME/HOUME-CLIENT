import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  FLOW_CONFIG,
  entryRouteToFlowRoute,
} from '@store/imageFlow/flowConfig';
import type {
  EntryRoute,
  ProductItem,
  ResultType,
} from '@store/imageFlow/types';

// 경로별 프리셋 (경로에 따라 preset이 달라짐을 나타내고, 경로별 타입 안정성을 위해 discriminated union 적용)
// 퍼널 진입 시점에 setFlow()로 저장 → 최종 이미지 생성 API 호출 시 사용
export type PresetData =
  | { type: 'banner'; bannerId: number; answerId: number } // 경로2
  | { type: 'floorPlan'; floorPlanId: number } // 경로3: 홈에서 도면 선택
  | { type: 'style'; styleId: number } // 경로4
  | {
      // 경로5(product)는 productIds(API payload) + productsToBeRestored(UI 복원, 로그인 게이트 복귀/재선택 진입 시 ProductTab useState 초기값으로 사용)을 함께 보관
      // (홈 화면에서 상품 '탭'은 url이 없으므로, 자체 url이 존재하는 banner/style 플로우와 달리 UI 복원을 위해 productsToBeRestored 필드까지 있어야 함)
      type: 'product';
      productIds: number[];
      productsToBeRestored: ProductItem[];
    }; // 경로5

/** mutation 이후 funnel clear되어도 결과 GA에 쓸 퍼널 입력값 */
export interface FlowAnalyticsSnapshot {
  floorPlanId?: number;
  moodBoardIds?: number[];
  activityCode?: string;
  furnitureChipCodes?: string;
  productIds?: number[];
}

interface ImageFlowState {
  entryRoute: EntryRoute | null;
  resultType: ResultType | null;
  preset: PresetData | null;
  flowSnapshot: FlowAnalyticsSnapshot | null;
  // 퍼널 진입 시 호출, 진입경로 + 프리셋 세팅 및 resultType 자동 매핑
  setFlow: (params: { entryRoute: EntryRoute; preset?: PresetData }) => void;
  setFlowSnapshot: (snapshot: FlowAnalyticsSnapshot) => void;
  // preset만 선택적으로 비움 (entryRoute/resultType은 ResultPage에서 사용하므로 유지해야 하는 케이스에 사용)
  clearPreset: () => void;
  // 퍼널 완료/이탈 시 호출
  reset: () => void;
}

export const useImageFlowStore = create<ImageFlowState>()(
  persist(
    (set) => ({
      entryRoute: null,
      resultType: null,
      preset: null,
      flowSnapshot: null,
      setFlow: ({ entryRoute, preset }) =>
        set({
          entryRoute,
          // 결과 페이지 타입은 FLOW_CONFIG 단일 소스에서 파생 (저장 resultType 필드는 S2에서 제거 예정)
          resultType: FLOW_CONFIG[entryRouteToFlowRoute(entryRoute)].resultView,
          preset: preset ?? null,
        }),
      setFlowSnapshot: (flowSnapshot) => set({ flowSnapshot }),
      clearPreset: () => set({ preset: null }),
      reset: () =>
        set({
          entryRoute: null,
          resultType: null,
          preset: null,
          flowSnapshot: null,
        }),
    }),
    {
      name: 'image-flow',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

/**
 * ImageSetup → /generate 이동 시 unmount cleanup에서 entryRoute clear 생략
 * (LoadingPage·ResultPage GA image_entry_route 유지, useExitImageFlow.reset()까지)
 */
let entryRouteHeld = false;

export const holdEntryRoute = (): void => {
  entryRouteHeld = true;
};

export const consumeEntryRouteHold = (): boolean => {
  const held = entryRouteHeld;
  entryRouteHeld = false;
  return held;
};
