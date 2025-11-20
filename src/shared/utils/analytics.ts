// Firebase Analytics에 이벤트를 쉽게 보내기 위한 헬퍼 함수 모음

import { logEvent, setUserProperties } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

import type { ImageGenerationVariant } from '@pages/generate/hooks/useABTest';

/**
 * 공통 Analytics 이벤트 로깅 헬퍼 함수
 *
 * 모든 페이지별 analytics 함수에서 반복되는 패턴을 추상화한 함수입니다.
 * - analytics 초기화 확인
 * - 이벤트 로깅
 * - 에러 핸들링
 * - 자동 로깅
 *
 * @param eventName - Firebase Analytics 이벤트 이름
 * @param params - 이벤트 파라미터 (기본적으로 page_path 포함)
 * @param logMessage - 콘솔 로그 메시지 (선택사항, 기본값: 이벤트 이름)
 */
export const logAnalyticsEvent = (
  eventName: string,
  params?: Record<string, unknown>,
  logMessage?: string
) => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, eventName, {
      page_path: window.location.pathname,
      ...params,
    });
    console.log(`[Firebase Analytics] ${logMessage || eventName} 이벤트 전송`);
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * A/B 테스트 그룹을 Firebase Analytics에 사용자 속성으로 설정
 *
 * 사용자 속성 설정:
 * - ab_image_variant: 'single' 또는 'multiple'
 * - Google Analytics 4에서 사용자 세그먼트 분석 가능
 * - 모든 이벤트에 자동으로 포함되어 그룹별 분석 가능
 *
 * @param variant - 'single' 또는 'multiple'
 */
export const setABTestGroup = (variant: ImageGenerationVariant) => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    setUserProperties(analytics, {
      ab_image_variant: variant, // 사용자 속성으로 A/B 그룹 저장
    });
    console.log('[Firebase Analytics] A/B 그룹 설정:', variant);
  } catch (error) {
    console.error('Analytics setUserProperties 오류:', error);
  }
};

/**
 * A/B 테스트 그룹 할당 이벤트 로깅
 *
 * 이벤트 정보:
 * - 이벤트명: ab_test_assigned
 * - 파라미터: variant, is_new_user, timestamp
 * - 목적: A/B 테스트 그룹 할당 시점 추적
 *
 * @param variant - 'single' 또는 'multiple'
 * @param isNewUser - 신규 할당 여부 (true: Firebase에서 새로 할당, false: 개발모드/캐시)
 */
export const logABTestAssignment = (
  variant: ImageGenerationVariant,
  isNewUser: boolean
) => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    logEvent(analytics, 'ab_test_assigned', {
      variant, // A/B 테스트 그룹
      is_new_user: isNewUser, // 신규 할당 여부
      timestamp: Date.now(), // 할당 시점
    });
    console.log('[Firebase Analytics] A/B 그룹 할당 이벤트:', variant);
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
