import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  consumeSessionEventBudget,
  createSessionCap,
  resetSessionEventBudget,
  SESSION_EVENT_BUDGET,
  shouldSample,
} from './sampling';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shouldSample', () => {
  it('rate가 1 이상이면 항상 true, 0 이하면 항상 false다', () => {
    expect(shouldSample(1)).toBe(true);
    expect(shouldSample(0)).toBe(false);
    expect(shouldSample(-1)).toBe(false);
  });

  it('rate 미만의 난수일 때만 true다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    expect(shouldSample(0.1)).toBe(true);

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(shouldSample(0.1)).toBe(false);
  });
});

describe('createSessionCap', () => {
  it('key별로 limit 횟수까지만 통과시킨다', () => {
    const cap = createSessionCap(2);

    expect(cap('a')).toBe(true);
    expect(cap('a')).toBe(true);
    expect(cap('a')).toBe(false);
  });

  it('key가 다르면 독립적으로 센다', () => {
    const cap = createSessionCap(1);

    expect(cap('a')).toBe(true);
    expect(cap('b')).toBe(true);
    expect(cap('a')).toBe(false);
  });
});

describe('consumeSessionEventBudget', () => {
  beforeEach(() => {
    resetSessionEventBudget();
  });

  it('상한까지 통과시키고 이후에는 막는다', () => {
    for (let i = 0; i < SESSION_EVENT_BUDGET; i += 1) {
      expect(consumeSessionEventBudget()).toBe(true);
    }

    expect(consumeSessionEventBudget()).toBe(false);
  });
});
