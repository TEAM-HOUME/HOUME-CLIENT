/**
 * Login 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: loginSocial
 * - Action: click, view 등
 * - Component: btnCTA, toast 등
 * - Function: LoginError 등 (없으면 생략)
 *
 * 이벤트 코드:
 * - loginSocial_click_btnCTA
 * - loginSocial_view_toastLoginError
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

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
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'loginSocial_click_btnCTA', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] loginSocial_click_btnCTA 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'loginSocial_view_toastLoginError', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] loginSocial_view_toastLoginError 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
