import { GA_EVENTS } from '@analytics/events';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { getLoginGatePageViewReturnParams } from '@analytics/utils/screenName/buildReturnScreenParams';

const settingScreenParams = () => ({
  screen_name: SCREEN_NAME.SETTING,
});

/** setting_page_view params */
export const getSettingPageViewParams = () =>
  getLoginGatePageViewReturnParams(SCREEN_NAME.MYPAGE);

export const trackSettingLogoutClick = () => {
  trackEvent(GA_EVENTS.setting.BTN_LOGOUT_CLICK, {
    ...settingScreenParams(),
    return_screen_name: SCREEN_NAME.HOME,
  });
};

export const trackSettingSuccessionClick = () => {
  trackEvent(GA_EVENTS.setting.BTN_SUCCESSION_CLICK);
};

export const trackSettingSuccessionModalView = () => {
  trackEvent(GA_EVENTS.setting.MD_SUCCESSION_VIEW);
};
