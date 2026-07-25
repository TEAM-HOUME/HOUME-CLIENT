import { useEffect, useMemo } from 'react';

import { useImageFlowStore } from '@store/useImageFlowStore';

import type { ProductItem } from './flowConfig';

/**
 * 복원할 상품 목록을 마운트 때 한 번 꺼내 돌려주는 훅.
 * - 목록 값은 첫 렌더에 고정해 돌려주고(useMemo), 실제로 비우는 건 effect에서 한다.
 * - effect가 두 번 실행돼도(개발 모드) 안전하다: 두 번째엔 이미 비어서 아무 일도 안 함.
 */
export const useConsumeProductRestore = (): ProductItem[] => {
  const restored = useMemo(() => {
    const flow = useImageFlowStore.getState().flow;
    return flow?.route === 'PRODUCT_SELECTION'
      ? (flow.productsToBeRestored ?? [])
      : [];
  }, []);

  useEffect(() => {
    useImageFlowStore.getState().consumeProductRestore();
  }, []);

  return restored;
};
