import { expect } from '@playwright/test';

export interface ExpectedRequest {
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
  moodBoardIds: number[];
  activity: string;
  furnitureIds: number[];
}

// expected는 호출한 시나리오의 literal이다. 제품 builder나 fixture에서 계산하지 않는다.
export function assertGenerateRequest(
  actual: unknown,
  expected: ExpectedRequest
) {
  expect(actual, '요청 body는 객체').not.toBeNull();
  expect(typeof actual).toBe('object');
  const body = actual as Record<string, unknown>;
  for (const key of [
    'floorPlanId',
    'floorPlanView',
    'isMirror',
    'activity',
  ] as const) {
    expect(body[key], key).toBe(expected[key]);
  }
  for (const key of ['moodBoardIds', 'furnitureIds'] as const) {
    expect(Array.isArray(body[key]), key + ' 배열').toBe(true);
    expect(new Set(body[key] as unknown[]), key + ' 정확한 ID 집합').toEqual(
      new Set(expected[key])
    );
  }
}
