import { useFunnelStore } from '@store/useFunnelStore';
import {
  useImageFlowStore,
  type FlowAnalyticsSnapshot,
} from '@store/useImageFlowStore';

export const getFlowAnalyticsSnapshot = (): FlowAnalyticsSnapshot | null =>
  useImageFlowStore.getState().flowSnapshot;

/** mutation onSettled 전 — 결과 GA용 퍼널 입력값 백업 (풀퍼널) */
export const captureFullFunnelFlowSnapshot = (
  snapshot: FlowAnalyticsSnapshot
): void => {
  useImageFlowStore.getState().setFlowSnapshot(snapshot);
};

/**
 * mutation onSettled 전 — 결과 GA용 퍼널 입력값 백업 (숏퍼널)
 * useActivityInfo에서 이미 저장됐으면 skip
 */
export const ensureShortFunnelFlowSnapshot = (): void => {
  const { flowSnapshot, flow } = useImageFlowStore.getState();
  if (flowSnapshot) return;

  const funnel = useFunnelStore.getState();
  useImageFlowStore.getState().setFlowSnapshot({
    floorPlanId: funnel.floorPlan?.floorPlanId,
    productIds:
      flow?.route === 'PRODUCT_SELECTION' ? flow.productIds : undefined,
  });
};
