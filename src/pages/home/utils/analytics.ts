/**
 * Home 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: landing
 * - Action: view, click 등
 * - Component: page, btn 등
 * - Function: TypeRest, TypeWork, TypeCafe, TypeMovie, Mypage
 *
 * - landing_view_page
 * - landing_click_btnTypeRest
 * - landing_click_btnTypeWork
 * - landing_click_btnTypeCafe
 * - landing_click_btnTypeMovie
 * - landing_click_btnMypage
 * - landing_scroll_depthTreshold50%
 * - landing_scroll_depthTreshold100%
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

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
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    const optionMap: Record<InteriorOption, string> = {
      휴식형: 'TypeRest',
      재택근무형: 'TypeWork',
      홈카페형: 'TypeCafe',
      영화감상형: 'TypeMovie',
    };

    const functionName = optionMap[option];
    const eventName = `landing_click_btn${functionName}`;

    logEvent(analytics, eventName, {
      option_type: option,
      page_path: window.location.pathname,
    });
    console.log(
      `[Firebase Analytics] ${eventName} 이벤트 전송 (옵션: ${option})`
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'landing_click_btnMypage', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] landing_click_btnMypage 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    const eventName = `landing_scroll_depthTreshold${percentage}%`;
    logEvent(analytics, eventName, {
      scroll_depth: percentage,
      page_path: window.location.pathname,
    });
    console.log(
      `[Firebase Analytics] ${eventName} 이벤트 전송 (스크롤 깊이: ${percentage}%)`
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
