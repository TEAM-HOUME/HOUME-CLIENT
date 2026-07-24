import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackSignupCompCompleteRegistration } from './signupCompAnalytics';

describe('trackSignupCompCompleteRegistration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.fbq;
  });

  it('Meta Pixel이 비활성화된 환경에서는 이벤트를 전송하지 않는다', () => {
    vi.stubEnv('VITE_ENABLE_META_PIXEL', 'false');
    const fbq = vi.fn();
    window.fbq = fbq;

    trackSignupCompCompleteRegistration();

    expect(fbq).not.toHaveBeenCalled();
  });

  it('Meta Pixel이 활성화된 환경에서는 CompleteRegistration 이벤트를 전송한다', () => {
    vi.stubEnv('VITE_ENABLE_META_PIXEL', 'true');
    const fbq = vi.fn();
    window.fbq = fbq;

    trackSignupCompCompleteRegistration();

    expect(fbq).toHaveBeenCalledOnce();
    expect(fbq).toHaveBeenCalledWith('track', 'CompleteRegistration');
  });
});
