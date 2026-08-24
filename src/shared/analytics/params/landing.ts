import type { ABTestGroup } from '@shared/types/abTest';

import type { LandingResponse } from '@apis/__generated__/data-contracts';

/** 노션 test_type: A type = Solid, B type = Ghost */
export type LandingTestType = 'Solid' | 'Ghost';

export interface LandingParams {
  test_type?: LandingTestType;
  landing_id?: number;
  landing_name?: string;
}

const LANDING_TEST_TYPE_BY_VARIANT: Record<ABTestGroup, LandingTestType> = {
  A: 'Solid',
  B: 'Ghost',
};

export const getLandingTestType = (variant: ABTestGroup): LandingTestType =>
  LANDING_TEST_TYPE_BY_VARIANT[variant];

export const getLandingCtaParams = (landing?: LandingResponse) => {
  const landingId = landing?.id;
  const landingName = landing?.name;

  return {
    ...(landingId !== undefined && { landing_id: landingId }),
    ...(landingName !== undefined && { landing_name: landingName }),
  };
};
