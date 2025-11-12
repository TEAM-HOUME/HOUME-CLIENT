/**
 * Signup 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: signupForm, signupSuccess
 * - Action: view, click 등
 * - Component: error, btnCTA 등
 * - Function: (없으면 생략)
 *
 * 이벤트 코드:
 * - signupForm_view_error
 * - signupForm_click_btnCTA
 * - signupSuccess_click_btnCTA
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

/**
 * 회원가입 폼 에러 뷰 이벤트
 *
 * 이벤트 코드: signupForm_view_error
 * - Page: signupForm
 * - Action: view
 * - Component: error
 * - Function: (없음)
 *
 * 회원가입 폼에서 에러가 표시될 때 전송
 */
export const logSignupFormViewError = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'signupForm_view_error', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] signupForm_view_error 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 회원가입 폼 CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: signupForm_click_btnCTA
 * - Page: signupForm
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "회원가입 완료하기" 버튼
 */
export const logSignupFormClickBtnCTA = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'signupForm_click_btnCTA', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] signupForm_click_btnCTA 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 회원가입 성공 페이지 CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: signupSuccess_click_btnCTA
 * - Page: signupSuccess
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "이미지 만들러가기" 버튼
 */
export const logSignupSuccessClickBtnCTA = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'signupSuccess_click_btnCTA', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] signupSuccess_click_btnCTA 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
