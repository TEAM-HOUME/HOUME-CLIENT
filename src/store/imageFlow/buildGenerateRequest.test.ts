import { describe, expect, it } from 'vitest';

import {
  buildGenerateRequest,
  GENERATE_INVALID_REASON,
  type FunnelData,
  type GenerateInvalidReason,
} from './buildGenerateRequest';
import { FLOW_CONFIG, type ImageFlow } from './flowConfig';

/** invalid 결과에서 reason만 꺼낸다 (아니면 테스트가 실패해야 하므로 undefined 반환) */
const reasonOf = (
  plan: ReturnType<typeof buildGenerateRequest>
): GenerateInvalidReason | undefined =>
  plan.kind === 'invalid' ? plan.reason : undefined;

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

  it('route가 알 수 없는 값이면 invalid (switch default 방어)', () => {
    const flow = {
      route: 'UNKNOWN_ROUTE',
      phase: 'funnel',
    } as unknown as ImageFlow;
    expect(buildGenerateRequest(flow, fullFunnelData).kind).toBe('invalid');
  });
});

// invalid는 전부 같은 값이라 "생성 버튼을 눌렀는데 홈으로 튕겼다"의 원인을 알 수 없었다.
// reason이 원인별로 갈리는지 확인한다 — Sentry에서 이 값으로 이슈를 나눈다.
describe('buildGenerateRequest - invalid reason', () => {
  const fullFunnelFlow: ImageFlow = {
    route: 'GENERATE_BUTTON',
    phase: 'postFunnel',
  };

  it('flow가 null이면 noFlow, route는 null', () => {
    const plan = buildGenerateRequest(null, fullFunnelData);

    expect(reasonOf(plan)).toBe(GENERATE_INVALID_REASON.NO_FLOW);
    if (plan.kind === 'invalid') expect(plan.route).toBeNull();
  });

  it('도면 손상은 invalidFloorPlan', () => {
    expect(
      reasonOf(
        buildGenerateRequest(fullFunnelFlow, {
          ...fullFunnelData,
          floorPlan: null,
        })
      )
    ).toBe(GENERATE_INVALID_REASON.INVALID_FLOOR_PLAN);
  });

  // 풀퍼널은 어느 스텝의 입력이 사라졌는지 구분돼야 원인 추적이 된다
  it('풀퍼널 입력은 무드보드·활동·가구를 따로 구분한다', () => {
    expect(
      reasonOf(
        buildGenerateRequest(fullFunnelFlow, {
          ...fullFunnelData,
          moodBoardIds: null,
        })
      )
    ).toBe(GENERATE_INVALID_REASON.INVALID_MOOD_BOARD_IDS);

    expect(
      reasonOf(
        buildGenerateRequest(fullFunnelFlow, {
          ...fullFunnelData,
          activityInfo: { furnitureIds: [1] },
        })
      )
    ).toBe(GENERATE_INVALID_REASON.INVALID_ACTIVITY);

    expect(
      reasonOf(
        buildGenerateRequest(fullFunnelFlow, {
          ...fullFunnelData,
          activityInfo: { activity: 'REST' },
        })
      )
    ).toBe(GENERATE_INVALID_REASON.INVALID_FURNITURE_IDS);
  });

  it('배너·스타일·상품 경로도 각각 구분된다', () => {
    const bannerFlow = {
      route: 'HOME_BANNER',
      phase: 'postFunnel',
      bannerId: 1.5,
      answerId: 2,
    } as unknown as ImageFlow;
    expect(reasonOf(buildGenerateRequest(bannerFlow, shortFunnelData))).toBe(
      GENERATE_INVALID_REASON.INVALID_BANNER_REF
    );

    const styleFlow = {
      route: 'STYLE_RESTYLE',
      phase: 'postFunnel',
      styleId: null,
    } as unknown as ImageFlow;
    expect(reasonOf(buildGenerateRequest(styleFlow, shortFunnelData))).toBe(
      GENERATE_INVALID_REASON.INVALID_STYLE_REF
    );

    const productFlow: ImageFlow = {
      route: 'PRODUCT_SELECTION',
      phase: 'postFunnel',
      isRegenerate: false,
      productIds: [],
      productsToBeRestored: null,
    };
    expect(reasonOf(buildGenerateRequest(productFlow, shortFunnelData))).toBe(
      GENERATE_INVALID_REASON.INVALID_PRODUCT_IDS
    );
  });

  it('알 수 없는 route는 unknownRoute', () => {
    const flow = {
      route: 'UNKNOWN_ROUTE',
      phase: 'funnel',
    } as unknown as ImageFlow;

    expect(reasonOf(buildGenerateRequest(flow, fullFunnelData))).toBe(
      GENERATE_INVALID_REASON.UNKNOWN_ROUTE
    );
  });

  it('route가 있으면 invalid에도 함께 담는다', () => {
    const plan = buildGenerateRequest(fullFunnelFlow, {
      ...fullFunnelData,
      floorPlan: null,
    });

    if (plan.kind === 'invalid') expect(plan.route).toBe('GENERATE_BUTTON');
  });
});

// FLOW_CONFIG.requestKind가 실제 buildGenerateRequest 결과의 kind와 일치하는지 (둘의 드리프트 방지)
describe('buildGenerateRequest - kind가 FLOW_CONFIG.requestKind와 일치', () => {
  const cases: { flow: ImageFlow; funnel: FunnelData }[] = [
    {
      flow: { route: 'GENERATE_BUTTON', phase: 'postFunnel' },
      funnel: fullFunnelData,
    },
    {
      flow: {
        route: 'FLOOR_PLAN',
        phase: 'postFunnel',
        presetFloorPlanId: null,
      },
      funnel: fullFunnelData,
    },
    {
      flow: {
        route: 'HOME_BANNER',
        phase: 'postFunnel',
        bannerId: 5,
        answerId: 7,
      },
      funnel: shortFunnelData,
    },
    {
      flow: { route: 'STYLE_RESTYLE', phase: 'postFunnel', styleId: 9 },
      funnel: shortFunnelData,
    },
    {
      flow: {
        route: 'PRODUCT_SELECTION',
        phase: 'postFunnel',
        isRegenerate: false,
        productIds: [1],
        productsToBeRestored: null,
      },
      funnel: shortFunnelData,
    },
  ];

  cases.forEach(({ flow, funnel }) => {
    it(`${flow.route}: kind가 FLOW_CONFIG.requestKind와 같다`, () => {
      expect(buildGenerateRequest(flow, funnel).kind).toBe(
        FLOW_CONFIG[flow.route].requestKind
      );
    });
  });
});
