// Signup 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

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
  logAnalyticsEvent('signupForm_view_error');
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
  logAnalyticsEvent('signupForm_click_btnCTA');
};
