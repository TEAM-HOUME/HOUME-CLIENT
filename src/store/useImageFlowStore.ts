import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  FlowPhase,
  ImageFlow,
  ProductItem,
  StartFlowInput,
} from '@store/imageFlow/flowConfig';
import { useFunnelStore } from '@store/useFunnelStore';

/** 퍼널 데이터를 비운 뒤에도 결과 화면 GA에 쓰려고 미리 저장해 둔 퍼널 입력값 */
export interface FlowAnalyticsSnapshot {
  floorPlanId?: number;
  moodBoardIds?: number[];
  activityCode?: string;
  furnitureChipCodes?: string;
  productIds?: number[];
}

interface ImageFlowStore {
  // 지금 진행 중인 이미지 생성 플로우 (없으면 null)
  flow: ImageFlow | null;
  // 결과 화면 GA용 백업. flow와 지우는 시점이 다르다
  // (completeGenerationRequest는 이걸 남기고, abandonFlow는 같이 지운다)
  flowSnapshot: FlowAnalyticsSnapshot | null;

  /** 플로우를 새로 시작한다(phase=funnel). 퍼널 데이터는 안 건드림 —
   *  필요하면 부르는 쪽에서 먼저 useFunnelStore.reset()을 한다(useProductTabController/ListResult). */
  startFlow: (input: StartFlowInput) => void;
  /** 퍼널을 빠져나올 때 호출. phase를 postFunnel로 바꾼다(route는 그대로). flow가 없으면 아무것도 안 함. */
  leaveFunnel: () => void;
  /** 홈에서 미리 고른 도면 id를 한 번만 꺼낸다(꺼내면 비움). FLOOR_PLAN 진입이 아니거나 이미 꺼냈으면 null. */
  consumeFloorPlanPreset: () => number | null;
  /** 복원할 상품 목록을 한 번만 꺼낸다(꺼내면 비움). 상품 플로우가 아니거나 이미 꺼냈으면 null. */
  consumeProductRestore: () => ProductItem[] | null;
  /** 이미지 생성 요청을 보낸 직후 정리. 퍼널 입력값과 다 쓴 값(도면 id·복원 상품)을 비운다.
   *  route/phase/flowSnapshot은 결과 화면에서 써야 하니 남긴다. */
  completeGenerationRequest: () => void;
  /** 플로우를 완전히 끝낸다. flow와 flowSnapshot을 지우고 퍼널 데이터도 비운다. */
  abandonFlow: () => void;
  /** 결과 화면 GA용 스냅샷 저장 */
  setFlowSnapshot: (snapshot: FlowAnalyticsSnapshot) => void;
}

const FUNNEL_PHASE: FlowPhase = 'funnel';

export const useImageFlowStore = create<ImageFlowStore>()(
  persist(
    (set, get) => ({
      flow: null,
      flowSnapshot: null,

      startFlow: (input) => {
        switch (input.route) {
          case 'GENERATE_BUTTON':
            set({ flow: { route: 'GENERATE_BUTTON', phase: FUNNEL_PHASE } });
            return;
          case 'FLOOR_PLAN':
            set({
              flow: {
                route: 'FLOOR_PLAN',
                phase: FUNNEL_PHASE,
                presetFloorPlanId: input.presetFloorPlanId ?? null,
              },
            });
            return;
          case 'HOME_BANNER':
            set({
              flow: {
                route: 'HOME_BANNER',
                phase: FUNNEL_PHASE,
                bannerId: input.bannerId,
                answerId: input.answerId,
              },
            });
            return;
          case 'STYLE_RESTYLE':
            set({
              flow: {
                route: 'STYLE_RESTYLE',
                phase: FUNNEL_PHASE,
                styleId: input.styleId,
              },
            });
            return;
          case 'PRODUCT_SELECTION':
            set({
              flow: {
                route: 'PRODUCT_SELECTION',
                phase: FUNNEL_PHASE,
                isRegenerate: input.isRegenerate,
                productIds: input.productIds,
                productsToBeRestored: input.productsToBeRestored,
              },
            });
            return;
        }
      },

      leaveFunnel: () => {
        const { flow } = get();
        if (!flow) return;
        set({ flow: { ...flow, phase: 'postFunnel' } as ImageFlow });
      },

      consumeFloorPlanPreset: () => {
        const { flow } = get();
        if (flow?.route !== 'FLOOR_PLAN' || flow.presetFloorPlanId == null) {
          return null;
        }
        const id = flow.presetFloorPlanId;
        set({ flow: { ...flow, presetFloorPlanId: null } });
        return id;
      },

      consumeProductRestore: () => {
        const { flow } = get();
        if (
          flow?.route !== 'PRODUCT_SELECTION' ||
          flow.productsToBeRestored == null
        ) {
          return null;
        }
        const items = flow.productsToBeRestored;
        set({ flow: { ...flow, productsToBeRestored: null } });
        return items;
      },

      completeGenerationRequest: () => {
        // 퍼널 입력값을 비운다 (안 비우면 /generate로 다시 들어왔을 때 같은 요청이 또 나감)
        useFunnelStore.getState().reset();
        // 다 쓴 값(도면 id·복원 상품)을 비운다 (안 비우면 홈에 돌아왔을 때 상품이 되살아남)
        const { flow } = get();
        if (flow?.route === 'FLOOR_PLAN' && flow.presetFloorPlanId != null) {
          set({ flow: { ...flow, presetFloorPlanId: null } });
        } else if (
          flow?.route === 'PRODUCT_SELECTION' &&
          flow.productsToBeRestored != null
        ) {
          set({ flow: { ...flow, productsToBeRestored: null } });
        }
      },

      abandonFlow: () => {
        useFunnelStore.getState().reset();
        set({ flow: null, flowSnapshot: null });
      },

      setFlowSnapshot: (flowSnapshot) => set({ flowSnapshot }),
    }),
    {
      name: 'image-flow',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      // sessionStorage에 예전 버전(implicit state machine 리팩토링 이전) 형식으로 저장돼 있던 값은 되살리지 않고 버린다(flow=null로 시작).
      // 배포 도중 퍼널을 밟던 탭만 홈으로 돌아가는 정도라 문제되지 않음.
      migrate: () => ({ flow: null, flowSnapshot: null }) as ImageFlowStore,
    }
  )
);
