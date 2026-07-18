import { describe, expect, it } from 'vitest';

import { buildGenerateRequest, type FunnelData } from './buildGenerateRequest';

import type { ImageFlow } from './types';

const validFloorPlan = {
  floorPlanId: 1,
  floorPlanView: '창문뷰',
  isMirror: false,
};

const fullFunnelData: FunnelData = {
  floorPlan: validFloorPlan,
  moodBoardIds: [10, 11],
  activityInfo: { activity: 'REST', furnitureIds: [20, 21] },
};

const shortFunnelData: FunnelData = {
  floorPlan: validFloorPlan,
  moodBoardIds: null,
  activityInfo: null,
};

describe('buildGenerateRequest - 성공 케이스', () => {
  it('GENERATE_BUTTON → fullFunnel', () => {
    const flow: ImageFlow = { route: 'GENERATE_BUTTON', phase: 'postFunnel' };
    const plan = buildGenerateRequest(flow, fullFunnelData);
    expect(plan.kind).toBe('fullFunnel');
    if (plan.kind === 'fullFunnel') {
      expect(plan.payload).toEqual({
        floorPlanId: 1,
        floorPlanView: '창문뷰',
        isMirror: false,
        moodBoardIds: [10, 11],
        activity: 'REST',
        furnitureIds: [20, 21],
      });
    }
  });

  it('FLOOR_PLAN → fullFunnel', () => {
    const flow: ImageFlow = {
      route: 'FLOOR_PLAN',
      phase: 'postFunnel',
      presetFloorPlanId: null,
    };
    expect(buildGenerateRequest(flow, fullFunnelData).kind).toBe('fullFunnel');
  });

  it('HOME_BANNER → banner', () => {
    const flow: ImageFlow = {
      route: 'HOME_BANNER',
      phase: 'postFunnel',
      bannerId: 5,
      answerId: 7,
    };
    const plan = buildGenerateRequest(flow, shortFunnelData);
    expect(plan.kind).toBe('banner');
    if (plan.kind === 'banner') {
      expect(plan.payload).toEqual({
        bannerId: 5,
        answerId: 7,
        floorPlanId: 1,
        floorPlanView: '창문뷰',
        isMirror: false,
      });
    }
  });

  it('STYLE_RESTYLE → otherStyle (styleId를 bannerId 필드로 매핑)', () => {
    const flow: ImageFlow = {
      route: 'STYLE_RESTYLE',
      phase: 'postFunnel',
      styleId: 9,
    };
    const plan = buildGenerateRequest(flow, shortFunnelData);
    expect(plan.kind).toBe('otherStyle');
    if (plan.kind === 'otherStyle') {
      expect(plan.payload).toEqual({
        bannerId: 9,
        floorPlanId: 1,
        floorPlanView: '창문뷰',
        isMirror: false,
      });
    }
  });

  it('PRODUCT_SELECTION → product (productsToBeRestored는 payload에서 무시)', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'postFunnel',
      isRegenerate: false,
      productIds: [1, 2, 3],
      productsToBeRestored: null,
    };
    const plan = buildGenerateRequest(flow, shortFunnelData);
    expect(plan.kind).toBe('product');
    if (plan.kind === 'product') {
      expect(plan.payload).toEqual({
        floorPlanId: 1,
        floorPlanView: '창문뷰',
        isMirror: false,
        productIds: [1, 2, 3],
      });
    }
  });

  it('product: isRegenerate=true여도 payload는 동일 (GA 전용 구분)', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'postFunnel',
      isRegenerate: true,
      productIds: [1],
      productsToBeRestored: null,
    };
    expect(buildGenerateRequest(flow, shortFunnelData).kind).toBe('product');
  });
});

describe('buildGenerateRequest - invalid 케이스', () => {
  it('flow가 null이면 invalid', () => {
    expect(buildGenerateRequest(null, fullFunnelData).kind).toBe('invalid');
  });

  it('floorPlan이 손상되면 invalid', () => {
    const flow: ImageFlow = { route: 'GENERATE_BUTTON', phase: 'postFunnel' };
    expect(
      buildGenerateRequest(flow, { ...fullFunnelData, floorPlan: null }).kind
    ).toBe('invalid');
    expect(
      buildGenerateRequest(flow, {
        ...fullFunnelData,
        floorPlan: { floorPlanId: 'x', floorPlanView: 'v', isMirror: false },
      }).kind
    ).toBe('invalid');
  });

  it('fullFunnel: moodBoardIds 누락 시 invalid', () => {
    const flow: ImageFlow = { route: 'GENERATE_BUTTON', phase: 'postFunnel' };
    expect(
      buildGenerateRequest(flow, { ...fullFunnelData, moodBoardIds: null }).kind
    ).toBe('invalid');
  });

  it('fullFunnel: activity 누락 시 invalid', () => {
    const flow: ImageFlow = { route: 'GENERATE_BUTTON', phase: 'postFunnel' };
    expect(
      buildGenerateRequest(flow, {
        ...fullFunnelData,
        activityInfo: { furnitureIds: [1] },
      }).kind
    ).toBe('invalid');
  });

  it('fullFunnel: furnitureIds 누락 시 invalid', () => {
    const flow: ImageFlow = { route: 'GENERATE_BUTTON', phase: 'postFunnel' };
    expect(
      buildGenerateRequest(flow, {
        ...fullFunnelData,
        activityInfo: { activity: 'REST' },
      }).kind
    ).toBe('invalid');
  });

  it('product: productIds가 0개면 invalid', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'postFunnel',
      isRegenerate: false,
      productIds: [],
      productsToBeRestored: null,
    };
    expect(buildGenerateRequest(flow, shortFunnelData).kind).toBe('invalid');
  });

  it('product: productIds가 7개(초과)면 invalid', () => {
    const flow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'postFunnel',
      isRegenerate: false,
      productIds: [1, 2, 3, 4, 5, 6, 7],
      productsToBeRestored: null,
    };
    expect(buildGenerateRequest(flow, shortFunnelData).kind).toBe('invalid');
  });

  it('banner: 비정수 필드면 invalid', () => {
    const flow = {
      route: 'HOME_BANNER',
      phase: 'postFunnel',
      bannerId: 1.5,
      answerId: 2,
    } as unknown as ImageFlow;
    expect(buildGenerateRequest(flow, shortFunnelData).kind).toBe('invalid');
  });
});
