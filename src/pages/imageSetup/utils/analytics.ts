/**
 * ImageSetup 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: selectHouseInfo, selectFloorPlan 등
 * - Action: view, click 등
 * - Component: btnCTA, modal, error 등
 * - Function: Inactive, Exit, Continue 등 (없으면 생략)
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

// ============================================================================
/**
 * [퍼널 STEP1] 집 구조 선택 페이지 (HouseInfo) 관련 이벤트
 *
 * 이벤트 코드:
 * - selectHouseInfo_click_btnCTA
 * - selectHouseInfo_click_btnCTAInactive
 * - selectHouseInfo_view_modal
 * - selectHouseInfo_click_modalExit
 * - selectHouseInfo_click_modalContinue
 * - selectHouseInfo_view_error
 */
// ============================================================================

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

// ============================================================================
/**
 * [퍼널 STEP2] 평면도 선택 페이지 (FloorPlan) 관련 이벤트
 *
 * 이벤트 코드:
 * - selectFloorPlan_click_btnNoPlan
 * - selectFloorPlan_view_modalNoPlan
 * - selectFloorPlan_click_btnCTASubmit
 * - selectFloorPlan_view_modalReversed
 * - selectFloorPlan_click_btnReversed
 * - selectFloorPlan_click_btnCTASelect
 * - selectFloorPlan_click_deemded
 */
// ============================================================================

/**
 * 평면도 선택 NoPlan 버튼 클릭 이벤트
 *
 * 이벤트 코드: selectFloorPlan_click_btnNoPlan
 * - Page: selectFloorPlan
 * - Action: click
 * - Component: btn
 * - Function: NoPlan
 *
 * 버튼: "우리 집 구조와 유사한 템플릿이 없어요" 버튼
 */
export const logSelectFloorPlanClickBtnNoPlan = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_click_btnNoPlan', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_click_btnNoPlan 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 NoPlan 모달 뷰 이벤트
 *
 * 이벤트 코드: selectFloorPlan_view_modalNoPlan
 * - Page: selectFloorPlan
 * - Action: view
 * - Component: modal
 * - Function: NoPlan
 *
 * NoMatchSheet 모달이 표시될 때 전송
 */
export const logSelectFloorPlanViewModalNoPlan = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_view_modalNoPlan', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_view_modalNoPlan 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 Submit CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: selectFloorPlan_click_btnCTASubmit
 * - Page: selectFloorPlan
 * - Action: click
 * - Component: btnCTA
 * - Function: Submit
 *
 * CTA 버튼: NoMatchSheet의 "제출하기" 버튼
 */
export const logSelectFloorPlanClickBtnCTASubmit = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_click_btnCTASubmit', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_click_btnCTASubmit 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 Reversed 모달 뷰 이벤트
 *
 * 이벤트 코드: selectFloorPlan_view_modalReversed
 * - Page: selectFloorPlan
 * - Action: view
 * - Component: modal
 * - Function: Reversed
 *
 * FlipSheet 모달이 표시될 때 전송
 */
export const logSelectFloorPlanViewModalReversed = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_view_modalReversed', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_view_modalReversed 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 Reversed 버튼 클릭 이벤트
 *
 * 이벤트 코드: selectFloorPlan_click_btnReversed
 * - Page: selectFloorPlan
 * - Action: click
 * - Component: btn
 * - Function: Reversed
 *
 * 버튼: FlipSheet의 좌우반전 버튼
 */
export const logSelectFloorPlanClickBtnReversed = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_click_btnReversed', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_click_btnReversed 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 Select CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: selectFloorPlan_click_btnCTASelect
 * - Page: selectFloorPlan
 * - Action: click
 * - Component: btnCTA
 * - Function: Select
 *
 * CTA 버튼: FlipSheet의 "선택하기" 버튼
 */
export const logSelectFloorPlanClickBtnCTASelect = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_click_btnCTASelect', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_click_btnCTASelect 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 평면도 선택 도면 클릭 이벤트
 *
 * 이벤트 코드: selectFloorPlan_click_deemded
 * - Page: selectFloorPlan
 * - Action: click
 * - Component: deemded
 * - Function: (없음)
 *
 * 평면도 이미지 클릭 시 전송
 */
export const logSelectFloorPlanClickDeemded = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectFloorPlan_click_deemded', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectFloorPlan_click_deemded 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

// ============================================================================
/**
 * [퍼널 STEP3] 무드보드 선택 페이지 (InteriorStyle) 관련 이벤트
 *
 * 이벤트 코드:
 * - selectMoodboard_click_btnCTA
 * - selectMoodboard_click_btnCTAInactive
 */
// ============================================================================

/**
 * 무드보드 선택 CTA 버튼 클릭 이벤트 (활성 상태)
 *
 * 이벤트 코드: selectMoodboard_click_btnCTA
 * - Page: selectMoodboard
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "집 구조 선택하기" 버튼 (활성 상태)
 */
export const logSelectMoodboardClickBtnCTA = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectMoodboard_click_btnCTA', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectMoodboard_click_btnCTA 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 무드보드 선택 CTA 버튼 클릭 이벤트 (비활성 상태)
 *
 * 이벤트 코드: selectMoodboard_click_btnCTAInactive
 * - Page: selectMoodboard
 * - Action: click
 * - Component: btnCTA
 * - Function: Inactive
 *
 * CTA 버튼: "집 구조 선택하기" 버튼 (비활성 상태)
 */
export const logSelectMoodboardClickBtnCTAInactive = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'selectMoodboard_click_btnCTAInactive', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] selectMoodboard_click_btnCTAInactive 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
