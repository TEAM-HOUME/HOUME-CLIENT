/**
 * ImageSetup 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: selectHouseInfo, selectFloorPlan 등
 * - Action: view, click 등
 * - Component: btnCTA, modal, error 등
 * - Function: Inactive, Exit, Continue 등 (없으면 생략)
 *
 * 이벤트 코드:
 * - selectHouseInfo_click_btnCTA
 * - selectHouseInfo_click_btnCTAInactive
 * - selectHouseInfo_view_modal
 * - selectHouseInfo_click_modalExit
 * - selectHouseInfo_click_modalContinue
 * - selectHouseInfo_view_error
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

/**
 * 집 구조 선택 CTA 버튼 클릭 이벤트 (활성 상태)
 *
 * 이벤트 코드: selectHouseInfo_click_btnCTA
 * - Page: selectHouseInfo
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "집 구조 선택하기" 버튼 (활성 상태)
 */
export const logSelectHouseInfoClickBtnCTA = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_click_btnCTA', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectHouseInfo_click_btnCTA 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 집 구조 선택 CTA 버튼 클릭 이벤트 (비활성 상태)
 *
 * 이벤트 코드: selectHouseInfo_click_btnCTAInactive
 * - Page: selectHouseInfo
 * - Action: click
 * - Component: btnCTA
 * - Function: Inactive
 *
 * CTA 버튼: "집 구조 선택하기" 버튼 (비활성 상태)
 */
export const logSelectHouseInfoClickBtnCTAInactive = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_click_btnCTAInactive', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectHouseInfo_click_btnCTAInactive 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 집 구조 선택 모달 뷰 이벤트
 *
 * 이벤트 코드: selectHouseInfo_view_modal
 * - Page: selectHouseInfo
 * - Action: view
 * - Component: modal
 * - Function: (없음)
 *
 * 모달이 표시될 때 전송
 */
export const logSelectHouseInfoViewModal = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_view_modal', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] selectHouseInfo_view_modal 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 집 구조 선택 모달 Exit 클릭 이벤트
 *
 * 이벤트 코드: selectHouseInfo_click_modalExit
 * - Page: selectHouseInfo
 * - Action: click
 * - Component: modal
 * - Function: Exit
 *
 * 모달에서 Exit 버튼 클릭 시 전송
 */
export const logSelectHouseInfoClickModalExit = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_click_modalExit', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectHouseInfo_click_modalExit 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 집 구조 선택 모달 Continue 클릭 이벤트
 *
 * 이벤트 코드: selectHouseInfo_click_modalContinue
 * - Page: selectHouseInfo
 * - Action: click
 * - Component: modal
 * - Function: Continue
 *
 * 모달에서 Continue 버튼 클릭 시 전송
 */
export const logSelectHouseInfoClickModalContinue = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_click_modalContinue', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectHouseInfo_click_modalContinue 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 집 구조 선택 에러 뷰 이벤트
 *
 * 이벤트 코드: selectHouseInfo_view_error
 * - Page: selectHouseInfo
 * - Action: view
 * - Component: error
 * - Function: (없음)
 *
 * 에러가 표시될 때 전송
 */
export const logSelectHouseInfoViewError = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectHouseInfo_view_error', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] selectHouseInfo_view_error 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
