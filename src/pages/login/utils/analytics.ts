// Login 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

/**
 * CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: loginSocial_click_btnCTA
 * - Page: loginSocial
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: 카카오 로그인 버튼
 */
export const logLoginSocialClickBtnCTA = () => {
  logAnalyticsEvent('loginSocial_click_btnCTA');
};

/**
 * 로그인 실패 에러 토스트 뷰 이벤트
 *
 * 이벤트 코드: loginSocial_view_toastLoginError
 * - Page: loginSocial
 * - Action: view
 * - Component: toast
 * - Function: LoginError
 *
 * 로그인 실패 시 에러 토스트가 표시될 때 전송
 */
export const logLoginSocialViewToastLoginError = () => {
  logAnalyticsEvent('loginSocial_view_toastLoginError');
};
