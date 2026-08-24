import { GA_EVENTS } from '@analytics/events';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';

const editProfileScreenParams = () => ({
  screen_name: SCREEN_NAME.EDIT_PROFILE,
});

export const trackEditProfileCtaClick = () => {
  trackEvent(GA_EVENTS.editProfile.BTN_CTA_CLICK, {
    ...editProfileScreenParams(),
    return_screen_name: SCREEN_NAME.MYPAGE,
  });
};
