//ImageSetup 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

// ============================================================================
// [퍼널 STEP1] 집 구조 선택 페이지 (HouseInfo) 관련 이벤트

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
  logAnalyticsEvent('selectHouseInfo_click_btnCTA');
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
  logAnalyticsEvent('selectHouseInfo_click_btnCTAInactive');
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
  logAnalyticsEvent('selectHouseInfo_view_modal');
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
  logAnalyticsEvent('selectHouseInfo_click_modalExit');
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
  logAnalyticsEvent('selectHouseInfo_click_modalContinue');
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
  logAnalyticsEvent('selectHouseInfo_view_error');
};

// ============================================================================
// [퍼널 STEP2] 평면도 선택 페이지 (FloorPlan) 관련 이벤트

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
  logAnalyticsEvent('selectFloorPlan_click_btnNoPlan');
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
  logAnalyticsEvent('selectFloorPlan_view_modalNoPlan');
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
  logAnalyticsEvent('selectFloorPlan_click_btnCTASubmit');
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
  logAnalyticsEvent('selectFloorPlan_view_modalReversed');
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
  logAnalyticsEvent('selectFloorPlan_click_btnReversed');
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
  logAnalyticsEvent('selectFloorPlan_click_btnCTASelect');
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
  logAnalyticsEvent('selectFloorPlan_click_deemded');
};

// ============================================================================
// [퍼널 STEP3] 무드보드 선택 페이지 (InteriorStyle) 관련 이벤트

/**
 * 무드보드 선택 CTA 버튼 클릭 이벤트 (활성 상태)
 *
 * 이벤트 코드: selectMoodboard_click_btnCTA
 * - Page: selectMoodboard
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "주요 활동 선택하기" 버튼 (활성 상태)
 */
export const logSelectMoodboardClickBtnCTA = () => {
  logAnalyticsEvent('selectMoodboard_click_btnCTA');
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
 * CTA 버튼: "주요 활동 선택하기" 버튼 (비활성 상태)
 */
export const logSelectMoodboardClickBtnCTAInactive = () => {
  logAnalyticsEvent('selectMoodboard_click_btnCTAInactive');
};

// ============================================================================
// [퍼널 STEP4] 가구 선택 페이지 (ActivityInfo) 관련 이벤트

/**
 * 가구 선택 CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: selectFurniture_click_btnCTA
 * - Page: selectFurniture
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "이미지 생성하기" 버튼
 */
export const logSelectFurnitureClickBtnCTA = () => {
  logAnalyticsEvent('selectFurniture_click_btnCTA');
};

/**
 * 가구 선택 CTA 버튼 클릭 이벤트 (크레딧 에러)
 *
 * 이벤트 코드: selectFurniture_click_btnCTACreditError
 * - Page: selectFurniture
 * - Action: click
 * - Component: btnCTA
 * - Function: CreditError
 *
 * CTA 버튼: "이미지 생성하기" 버튼 (크레딧 부족 시)
 */
export const logSelectFurnitureClickBtnCTACreditError = () => {
  logAnalyticsEvent('selectFurniture_click_btnCTACreditError');
};
