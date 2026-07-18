import { describe, expect, it } from 'vitest';

import { ENTRY_ROUTE, type EntryRoute } from '@store/imageFlow/types';

import {
  FLOW_CONFIG,
  entryRouteToFlowRoute,
  isCurationViewType,
} from './flowConfig';

const ALL_ENTRY_ROUTES = Object.values(ENTRY_ROUTE) as EntryRoute[];

// FLOW_CONFIG가 기존 동작(RESULT_TYPE_MAP + getNextFunnelStep)을 그대로 재현하는지 고정한다.
// - resultView: 기존 RESULT_TYPE_MAP과 값이 일치해야 함
// - afterFloorPlan: 기존 getNextFunnelStep(INTERIOR_STYLE / IMAGE_LOADING)과 등가 (IMAGE_LOADING === GENERATE)
describe('FLOW_CONFIG (기존 매핑 동등성)', () => {
  const expectedResultView: Record<EntryRoute, string> = {
    [ENTRY_ROUTE.GENERATE_BUTTON]: 'FULL_FUNNEL',
    [ENTRY_ROUTE.HOME_BANNER]: 'BANNER',
    [ENTRY_ROUTE.FLOOR_PLAN]: 'FULL_FUNNEL',
    [ENTRY_ROUTE.STYLE_RESTYLE]: 'STYLE',
    [ENTRY_ROUTE.PRODUCT_SELECTION]: 'PRODUCT',
    [ENTRY_ROUTE.PRODUCT_REGENERATE]: 'PRODUCT',
  };

  const expectedAfterFloorPlan: Record<
    EntryRoute,
    'INTERIOR_STYLE' | 'GENERATE'
  > = {
    [ENTRY_ROUTE.GENERATE_BUTTON]: 'INTERIOR_STYLE',
    [ENTRY_ROUTE.FLOOR_PLAN]: 'INTERIOR_STYLE',
    [ENTRY_ROUTE.HOME_BANNER]: 'GENERATE',
    [ENTRY_ROUTE.STYLE_RESTYLE]: 'GENERATE',
    [ENTRY_ROUTE.PRODUCT_SELECTION]: 'GENERATE',
    [ENTRY_ROUTE.PRODUCT_REGENERATE]: 'GENERATE',
  };

  it.each(ALL_ENTRY_ROUTES)(
    '%s: resultView가 기존 RESULT_TYPE_MAP과 일치한다',
    (entryRoute) => {
      const config = FLOW_CONFIG[entryRouteToFlowRoute(entryRoute)];
      expect(config.resultView).toBe(expectedResultView[entryRoute]);
    }
  );

  it.each(ALL_ENTRY_ROUTES)(
    '%s: afterFloorPlan이 기존 getNextFunnelStep과 등가다',
    (entryRoute) => {
      const config = FLOW_CONFIG[entryRouteToFlowRoute(entryRoute)];
      expect(config.afterFloorPlan).toBe(expectedAfterFloorPlan[entryRoute]);
    }
  );
});

describe('entryRouteToFlowRoute', () => {
  it('PRODUCT_REGENERATE는 PRODUCT_SELECTION으로 접힌다', () => {
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.PRODUCT_REGENERATE)).toBe(
      'PRODUCT_SELECTION'
    );
  });

  it('나머지 5개 route는 동일한 FlowRoute로 매핑된다', () => {
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.GENERATE_BUTTON)).toBe(
      'GENERATE_BUTTON'
    );
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.HOME_BANNER)).toBe('HOME_BANNER');
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.FLOOR_PLAN)).toBe('FLOOR_PLAN');
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.STYLE_RESTYLE)).toBe(
      'STYLE_RESTYLE'
    );
    expect(entryRouteToFlowRoute(ENTRY_ROUTE.PRODUCT_SELECTION)).toBe(
      'PRODUCT_SELECTION'
    );
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
