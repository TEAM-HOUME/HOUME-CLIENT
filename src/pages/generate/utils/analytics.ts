// ResultImg 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

/**
 * ResultImg 슬라이드 왼쪽 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_slideLeft
 * - Page: resultImg
 * - Action: swipe
 * - Component: slide
 * - Function: Left
 *
 * 이미지 슬라이드를 왼쪽으로 스와이프할 때 전송
 */
export const logResultImgSwipeSlideLeft = () => {
  logAnalyticsEvent('resultImg_swipe_slideLeft');
};

/**
 * ResultImg 슬라이드 오른쪽 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_slideRight
 * - Page: resultImg
 * - Action: swipe
 * - Component: slide
 * - Function: Right
 *
 * 이미지 슬라이드를 오른쪽으로 스와이프할 때 전송
 */
export const logResultImgSwipeSlideRight = () => {
  logAnalyticsEvent('resultImg_swipe_slideRight');
};

/**
 * ResultImg 스팟 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnSpot
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: Spot
 *
 * 스팟 버튼 클릭 시 전송
 */
export const logResultImgClickBtnSpot = () => {
  logAnalyticsEvent('resultImg_click_btnSpot');
};

/**
 * ResultImg 더보기 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnMoreImg
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: MoreImg
 *
 * 더보기 버튼 클릭 시 전송
 */
export const logResultImgClickBtnMoreImg = () => {
  logAnalyticsEvent('resultImg_click_btnMoreImg');
};

/**
 * ResultImg 더보기 모달 뒤로가기 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_moreModalBack
 * - Page: resultImg
 * - Action: click
 * - Component: moreModal
 * - Function: Back
 *
 * 더보기 모달에서 뒤로가기 버튼 클릭 시 전송
 */
export const logResultImgClickMoreModalBack = () => {
  logAnalyticsEvent('resultImg_click_moreModalBack');
};

/**
 * ResultImg 더보기 모달 새로 만들기 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_moreModalMakeNew
 * - Page: resultImg
 * - Action: click
 * - Component: moreModal
 * - Function: MakeNew
 *
 * 더보기 모달에서 새로 만들기 버튼 클릭 시 전송
 */
export const logResultImgClickMoreModalMakeNew = () => {
  logAnalyticsEvent('resultImg_click_moreModalMakeNew');
};

/**
 * ResultImg 태그 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnTag
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: Tag
 *
 * 태그 버튼 클릭 시 전송
 */
export const logResultImgClickBtnTag = () => {
  logAnalyticsEvent('resultImg_click_btnTag');
};

/**
 * ResultImg 큐레이션 시트 위로 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_curationSheetUp
 * - Page: resultImg
 * - Action: swipe
 * - Component: curationSheet
 * - Function: Up
 *
 * 큐레이션 시트를 위로 스와이프할 때 전송
 */
export const logResultImgSwipeCurationSheetUp = () => {
  logAnalyticsEvent('resultImg_swipe_curationSheetUp');
};

/**
 * ResultImg 큐레이션 시트 아래로 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_curationSheetDown
 * - Page: resultImg
 * - Action: swipe
 * - Component: curationSheet
 * - Function: Down
 *
 * 큐레이션 시트를 아래로 스와이프할 때 전송
 */
export const logResultImgSwipeCurationSheetDown = () => {
  logAnalyticsEvent('resultImg_swipe_curationSheetDown');
};

/**
 * ResultImg 큐레이션 시트 가구 필터 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetFilterFurniture
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: FilterFurniture
 *
 * 큐레이션 시트에서 가구 필터 클릭 시 전송
 */
export const logResultImgClickCurationSheetFilterFurniture = () => {
  logAnalyticsEvent('resultImg_click_curationSheetFilterFurniture');
};

/**
 * ResultImg 큐레이션 시트 사이트 이동 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetBtnGoSite
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: BtnGoSite
 *
 * 큐레이션 시트에서 사이트 이동 버튼 클릭 시 전송
 */
export const logResultImgClickCurationSheetBtnGoSite = () => {
  logAnalyticsEvent('resultImg_click_curationSheetBtnGoSite');
};

/**
 * ResultImg 큐레이션 시트 저장 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetBtnSave
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: BtnSave
 *
 * 큐레이션 시트에서 저장 버튼 클릭 시 전송
 */
export const logResultImgClickCurationSheetBtnSave = () => {
  logAnalyticsEvent('resultImg_click_curationSheetBtnSave');
};

/**
 * ResultImg 큐레이션 시트 카드 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetCard
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: Card
 *
 * 큐레이션 시트에서 카드 클릭 시 전송
 */
export const logResultImgClickCurationSheetCard = () => {
  logAnalyticsEvent('resultImg_click_curationSheetCard');
};

/**
 * 이미지 생성 시작 페이지 CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: generateStart_click_btnCTA
 * - Page: generateStart
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "이미지 만들러가기" 버튼
 */
export const logGenerateStartClickBtnCTA = () => {
  logAnalyticsEvent('generateStart_click_btnCTA');
};
