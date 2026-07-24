import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { META_COMPLETE_REGISTRATION_PENDING_KEY } from '@shared/analytics/metaPixel';

import { trackSignupCompCompleteRegistration } from './signupCompAnalytics';

describe('trackSignupCompCompleteRegistration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.fbq;
  });

  it('Meta Pixel이 비활성화된 환경에서는 이벤트를 전송하지 않는다', () => {
    vi.stubEnv('VITE_ENABLE_META_PIXEL', 'false');
    sessionStorage.setItem(META_COMPLETE_REGISTRATION_PENDING_KEY, 'true');
    const fbq = vi.fn();
    window.fbq = fbq;

    trackSignupCompCompleteRegistration();

    expect(fbq).not.toHaveBeenCalled();
    expect(
      sessionStorage.getItem(META_COMPLETE_REGISTRATION_PENDING_KEY)
    ).toBeNull();
  });

  it('회원가입 성공 marker가 없으면 이벤트를 전송하지 않는다', () => {
    vi.stubEnv('VITE_ENABLE_META_PIXEL', 'true');
    const fbq = vi.fn();
    window.fbq = fbq;

    trackSignupCompCompleteRegistration();

    expect(fbq).not.toHaveBeenCalled();
  });

  it('회원가입 성공 marker를 소비해 CompleteRegistration 이벤트를 한 번만 전송한다', () => {
    vi.stubEnv('VITE_ENABLE_META_PIXEL', 'true');
    sessionStorage.setItem(META_COMPLETE_REGISTRATION_PENDING_KEY, 'true');
    const fbq = vi.fn();
    window.fbq = fbq;

    trackSignupCompCompleteRegistration();
    trackSignupCompCompleteRegistration();

    expect(fbq).toHaveBeenCalledOnce();
    expect(fbq).toHaveBeenCalledWith('track', 'CompleteRegistration');
    expect(
      sessionStorage.getItem(META_COMPLETE_REGISTRATION_PENDING_KEY)
    ).toBeNull();
  });
});
