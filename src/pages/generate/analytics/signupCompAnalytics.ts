import { GA_EVENTS } from '@shared/analytics/events';
import { VALID_LOGIN_STATUS } from '@shared/analytics/params/auth';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { trackEvent } from '@shared/analytics/track';
import { getLoginSocialParams } from '@shared/analytics/utils/loginEntryRoute';

const signupCompScreenParams = () => ({
  screen_name: SCREEN_NAME.SIGNUP_COMP,
});

export const getSignupCompPageViewParams = () => ({
  ...getLoginSocialParams(),
  is_valid_login: VALID_LOGIN_STATUS.ALL_PASSED,
});

export const trackSignupCompCtaClick = () => {
  const { return_screen_name } = getLoginSocialParams();

  trackEvent(GA_EVENTS.signupComp.BTN_CTA, {
    ...signupCompScreenParams(),
    return_screen_name,
  });
};

// Meta Pixel CompleteRegistration 이벤트 호출
export const trackSignupCompCompleteRegistration = () => {
  const isMetaPixelEnabled = import.meta.env.VITE_ENABLE_META_PIXEL === 'true';

  if (!isMetaPixelEnabled) {
    if (import.meta.env.DEV) {
      console.info(
        '[Meta Pixel] CompleteRegistration 전송 안 함: 비활성화된 환경'
      );
    }

    return;
  }

  if (typeof window.fbq !== 'function') {
    if (import.meta.env.DEV) {
      console.warn('[Meta Pixel] fbq가 로드되지 않았습니다.');
    }

    return;
  }

  window.fbq('track', 'CompleteRegistration');

  if (import.meta.env.DEV) {
    console.info('[Meta Pixel] CompleteRegistration 호출');
  }
};
