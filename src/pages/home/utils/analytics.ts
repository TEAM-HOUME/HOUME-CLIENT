// Home 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

import type { InteriorOption } from '../types/options';

/**
 * 인테리어 옵션 버튼 클릭 이벤트
 *
 * 이벤트 코드: landing_click_btnType{Option}
 * - landing_click_btnTypeRest (휴식형)
 * - landing_click_btnTypeWork (재택근무형)
 * - landing_click_btnTypeCafe (홈카페형)
 * - landing_click_btnTypeMovie (영화감상형)
 *
 * @param option - 선택한 인테리어 옵션 ('휴식형', '재택근무형', '홈카페형', '영화감상형')
 */
export const logLandingClickBtnType = (option: InteriorOption) => {
  const optionMap: Record<InteriorOption, string> = {
    휴식형: 'TypeRest',
    재택근무형: 'TypeWork',
    홈카페형: 'TypeCafe',
    영화감상형: 'TypeMovie',
  };

  const functionName = optionMap[option];
  const eventName = `landing_click_btn${functionName}`;

  logAnalyticsEvent(
    eventName,
    { option_type: option },
    `${eventName} 이벤트 전송 (옵션: ${option})`
  );
};

/**
 * 마이페이지 버튼 클릭 이벤트
 *
 * 이벤트 코드: landing_click_btnMypage
 * - Page: landing
 * - Action: click
 * - Component: btn
 * - Function: Mypage
 */
export const logLandingClickBtnMypage = () => {
  logAnalyticsEvent('landing_click_btnMypage');
};

/**
 * CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: landing_click_btnCTA
 * - Page: landing
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "우리집에 딱 맞는 스타일 만들기" 버튼
 */
export const logLandingClickBtnCTA = () => {
  logAnalyticsEvent('landing_click_btnCTA');
};

/**
 * 스크롤 깊이 임계값 도달 이벤트
 *
 * 이벤트 코드: landing_scroll_depthTreshold{Percentage}
 * - landing_scroll_depthTreshold50% (스크롤 50% 도달)
 * - landing_scroll_depthTreshold100% (스크롤 100% 도달)
 *
 * - Page: landing
 * - Action: scroll
 * - Component: depthTreshold
 * - Function: 50%, 100%
 *
 * @param percentage - 도달한 스크롤 깊이 (50 또는 100)
 */
export const logLandingScrollDepthTreshold = (percentage: 50 | 100) => {
  const eventName = `landing_scroll_depthTreshold${percentage}%`;
  logAnalyticsEvent(
    eventName,
    { scroll_depth: percentage },
    `${eventName} 이벤트 전송 (스크롤 깊이: ${percentage}%)`
  );
};
