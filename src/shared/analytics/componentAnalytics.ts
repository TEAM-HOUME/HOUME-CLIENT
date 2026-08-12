/**
 * component 이벤트 — Page Code 없는 공통 UI (topNav / 공통 모달 / 토스트)
 *
 * `screen_name`은 **이벤트 발생 화면** 기준.
 * - topNav: `trackCallback`에 넘길 params만 제공 (호출부에서 screenName 전달)
 * - 모달/토스트: screen_name까지 포함한 track 함수
 *
 * @see docs/ga-wiring-convention.md § 9 component 이벤트
 */
import { GA_EVENTS } from '@analytics/events';
import { SCREEN_NAME, type ScreenName } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';

// ─────────────────────────────────────────────
// topNav — LogoNavBar (trackCallback params)
// ─────────────────────────────────────────────

export const TOP_NAV_RETURN_SCREEN = {
  LOGO: { return_screen_name: SCREEN_NAME.HOME },
  CREATE_IMG: { return_screen_name: SCREEN_NAME.ROOM_TYPE },
  LOGIN: { return_screen_name: SCREEN_NAME.LOGIN_SOCIAL },
  MYPAGE: { return_screen_name: SCREEN_NAME.MYPAGE },
} as const;

// ─────────────────────────────────────────────
// 이탈 방지 모달 — GenImgQuit (LoadingPage)
// ─────────────────────────────────────────────

export const trackGenImgQuitMdQuitClick = (screenName: ScreenName) => {
  trackEvent(GA_EVENTS.component.GEN_IMG_QUIT_MD_QUIT_CLICK, {
    screen_name: screenName,
    return_screen_name: SCREEN_NAME.HOME,
  });
};

export const trackGenImgQuitMdKeepClick = () => {
  trackEvent(GA_EVENTS.component.GEN_IMG_QUIT_MD_KEEP_CLICK);
};

// ─────────────────────────────────────────────
// 정보 초기화 모달 — ResetInfo (FunnelLayout)
// ─────────────────────────────────────────────

export const trackResetInfoMdQuitClick = (screenName: ScreenName) => {
  trackEvent(GA_EVENTS.component.RESET_INFO_MD_QUIT_CLICK, {
    screen_name: screenName,
    return_screen_name: SCREEN_NAME.HOME,
  });
};

export const trackResetInfoMdKeepClick = () => {
  trackEvent(GA_EVENTS.component.RESET_INFO_MD_KEEP_CLICK);
};

// ─────────────────────────────────────────────
// 탈퇴 모달 — Succession (SettingPage)
// ─────────────────────────────────────────────

export const trackSuccessionMdCancelClick = () => {
  trackEvent(GA_EVENTS.component.SUCCESSION_MD_CANCEL_CLICK);
};

export const trackSuccessionMdByeClick = () => {
  trackEvent(GA_EVENTS.component.SUCCESSION_MD_BYE_CLICK, {
    screen_name: SCREEN_NAME.SETTING,
    return_screen_name: SCREEN_NAME.HOME,
  });
};

// ─────────────────────────────────────────────
// 찜 토스트 — (useJjymMutation)
// ─────────────────────────────────────────────

type SaveToastInput = {
  screenName: ScreenName | string;
  rawProductId: number;
  productName?: string;
};

const getSaveToastParams = ({
  screenName,
  rawProductId,
  productName,
}: SaveToastInput) => ({
  screen_name: screenName,
  product_id: rawProductId,
  product_name: productName,
});

export const trackToastSaveView = (input: SaveToastInput) => {
  trackEvent(GA_EVENTS.component.TOAST_SAVE_VIEW, getSaveToastParams(input));
};

export const trackToastUnsaveView = (input: SaveToastInput) => {
  trackEvent(GA_EVENTS.component.TOAST_UNSAVE_VIEW, getSaveToastParams(input));
};

export const trackSaveToastToSeeClick = (input: SaveToastInput) => {
  trackEvent(
    GA_EVENTS.component.SAVE_TOAST_TO_SEE_CLICK,
    getSaveToastParams(input)
  );
};

export const trackSaveToastCancelClick = (input: SaveToastInput) => {
  trackEvent(
    GA_EVENTS.component.SAVE_TOAST_CANCEL_CLICK,
    getSaveToastParams(input)
  );
};
