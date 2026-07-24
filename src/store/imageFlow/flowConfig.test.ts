import { describe, expect, it } from 'vitest';

import {
  ENTRY_ROUTE,
  FLOW_CONFIG,
  flowToEntryRoute,
  isCurationViewType,
  type FlowRoute,
  type ImageFlow,
} from './flowConfig';

// FLOW_CONFIG가 기존 동작(RESULT_TYPE_MAP + getNextFunnelStep)을 그대로 재현하는지 route별로 고정한다.
// - resultView: 기존 RESULT_TYPE_MAP과 값이 일치
// - afterFloorPlan: 기존 getNextFunnelStep(INTERIOR_STYLE / IMAGE_LOADING)과 등가 (IMAGE_LOADING === GENERATE)
describe('FLOW_CONFIG (기존 매핑 동등성)', () => {
  const expected: Record<
    FlowRoute,
    {
      resultView: string;
      afterFloorPlan: 'INTERIOR_STYLE' | 'GENERATE';
      requestKind: string;
    }
  > = {
    GENERATE_BUTTON: {
      resultView: 'FULL_FUNNEL',
      afterFloorPlan: 'INTERIOR_STYLE',
      requestKind: 'fullFunnel',
    },
    FLOOR_PLAN: {
      resultView: 'FULL_FUNNEL',
      afterFloorPlan: 'INTERIOR_STYLE',
      requestKind: 'fullFunnel',
    },
    HOME_BANNER: {
      resultView: 'BANNER',
      afterFloorPlan: 'GENERATE',
      requestKind: 'banner',
    },
    STYLE_RESTYLE: {
      resultView: 'STYLE',
      afterFloorPlan: 'GENERATE',
      requestKind: 'otherStyle',
    },
    PRODUCT_SELECTION: {
      resultView: 'PRODUCT',
      afterFloorPlan: 'GENERATE',
      requestKind: 'product',
    },
  };

  (Object.keys(expected) as FlowRoute[]).forEach((route) => {
    it(`${route}: resultView/afterFloorPlan/requestKind가 기존 매핑과 일치한다`, () => {
      expect(FLOW_CONFIG[route].resultView).toBe(expected[route].resultView);
      expect(FLOW_CONFIG[route].afterFloorPlan).toBe(
        expected[route].afterFloorPlan
      );
      expect(FLOW_CONFIG[route].requestKind).toBe(expected[route].requestKind);
    });
  });
});

// flow → GA용 EntryRoute(6값) 역변환. product의 isRegenerate만 SHOP_REGENERATE 구분을 만든다.
describe('flowToEntryRoute', () => {
  it('flow가 null이면 null', () => {
    expect(flowToEntryRoute(null)).toBeNull();
  });

  it('product + isRegenerate=true → PRODUCT_REGENERATE (GA SHOP_REGENERATE)', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'funnel',
      isRegenerate: true,
      productIds: [1],
      productsToBeRestored: null,
    };
    expect(flowToEntryRoute(flow)).toBe(ENTRY_ROUTE.PRODUCT_REGENERATE);
  });

  it('product + isRegenerate=false → PRODUCT_SELECTION (GA SHOP)', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'funnel',
      isRegenerate: false,
      productIds: [1],
      productsToBeRestored: null,
    };
    expect(flowToEntryRoute(flow)).toBe(ENTRY_ROUTE.PRODUCT_SELECTION);
  });

  it('그 외 route는 그대로 EntryRoute로 매핑된다', () => {
    expect(
      flowToEntryRoute({ route: 'GENERATE_BUTTON', phase: 'funnel' })
    ).toBe(ENTRY_ROUTE.GENERATE_BUTTON);
    expect(
      flowToEntryRoute({
        route: 'HOME_BANNER',
        phase: 'funnel',
        bannerId: 1,
        answerId: 2,
      })
    ).toBe(ENTRY_ROUTE.HOME_BANNER);
  });
});

describe('isCurationViewType', () => {
  it('BANNER/STYLE/PRODUCT는 추천형이 아니다 (false)', () => {
    expect(isCurationViewType('BANNER')).toBe(false);
    expect(isCurationViewType('STYLE')).toBe(false);
    expect(isCurationViewType('PRODUCT')).toBe(false);
  });

  it('FULL_FUNNEL/LEGACY/null/undefined는 추천형이다 (true)', () => {
    expect(isCurationViewType('FULL_FUNNEL')).toBe(true);
    expect(isCurationViewType('LEGACY')).toBe(true);
    expect(isCurationViewType(null)).toBe(true);
    expect(isCurationViewType(undefined)).toBe(true);
  });
});
