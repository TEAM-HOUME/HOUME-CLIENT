/**
 * Firebase Analytics에 이벤트를 쉽게 보내기 위한 헬퍼 함수 모음
 *
 * A/B 테스트 이벤트 추적:
 * 1. 사용자 그룹 할당 (ab_test_assigned)
 * 2. 이미지 생성 시작 (image_generation_start)
 * 3. 이미지 생성 완료 (image_generation_complete)
 * 4. 이미지 선호도 (image_preference)
 * 5. 사용자 액션 (user_action)
 * 6. 페이지 뷰 (page_view)
 *
 * 분석 목적:
 * - A/B 테스트 그룹별 사용자 행동 비교
 * - 이미지 생성 완료율 측정
 * - 사용자 선호도 분석
 * - 전환율 및 참여도 측정
 */

import { logEvent, setUserProperties } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

import type { ImageGenerationVariant } from '@pages/generate/hooks/useABTest';

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

/**
 * 이미지 생성 시작 이벤트
 *
 * 이벤트 정보:
 * - 이벤트명: image_generation_start
 * - 파라미터: ab_variant, image_type, timestamp
 * - 목적: 이미지 생성 시작 시점 추적 (A/B 그룹별 비교)
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param imageType - 이미지 타입 ('single' 또는 'multiple')
 */
export const logImageGenerationStart = (
  variant: ImageGenerationVariant,
  imageType?: string
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'image_generation_start', {
      ab_variant: variant, // A/B 테스트 그룹
      image_type: imageType || 'unknown', // 이미지 타입
      timestamp: Date.now(), // 시작 시점
    });
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 이미지 생성 완료 이벤트
 *
 * 이벤트 정보:
 * - 이벤트명: image_generation_complete
 * - 파라미터: ab_variant, success, duration_seconds, timestamp
 * - 목적: 이미지 생성 완료율 측정 (A/B 그룹별 비교)
 * - 분석: Firebase A/B Testing의 기본 목표 이벤트로 사용
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param success - 성공 여부 (true: 성공, false: 실패)
 * @param duration - 소요 시간 (초 단위, 선택사항)
 */
export const logImageGenerationComplete = (
  variant: ImageGenerationVariant,
  success: boolean,
  duration?: number
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'image_generation_complete', {
      ab_variant: variant, // A/B 테스트 그룹
      success, // 성공 여부
      duration_seconds: duration, // 소요 시간 (초)
      timestamp: Date.now(), // 완료 시점
    });
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 이미지 좋아요/싫어요 이벤트
 *
 * 이벤트 정보:
 * - 이벤트명: image_preference
 * - 파라미터: ab_variant, preference, image_id, timestamp
 * - 목적: 사용자 선호도 분석 (A/B 그룹별 비교)
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param isLike - 좋아요 여부 (true: 좋아요, false: 싫어요)
 * @param imageId - 이미지 ID (선택사항)
 */
export const logImagePreference = (
  variant: ImageGenerationVariant,
  isLike: boolean,
  imageId?: number
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'image_preference', {
      ab_variant: variant, // A/B 테스트 그룹
      preference: isLike ? 'like' : 'dislike', // 선호도
      image_id: imageId, // 이미지 ID
      timestamp: Date.now(), // 액션 시점
    });
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 사용자 액션 이벤트 (범용)
 *
 * 이벤트 정보:
 * - 이벤트명: user_action
 * - 파라미터: ab_variant, action, ...params, timestamp
 * - 목적: 다양한 사용자 액션 추적 (A/B 그룹별 비교)
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param action - 액션 이름 (예: 'button_click', 'page_scroll', 'form_submit')
 * @param params - 추가 파라미터 (선택사항)
 */
export const logUserAction = (
  variant: ImageGenerationVariant,
  action: string,
  params?: Record<string, unknown>
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'user_action', {
      ab_variant: variant, // A/B 테스트 그룹
      action, // 액션 이름
      ...params, // 추가 파라미터
      timestamp: Date.now(), // 액션 시점
    });
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * 페이지 뷰 이벤트
 *
 * 이벤트 정보:
 * - 이벤트명: page_view
 * - 파라미터: ab_variant, page_name, timestamp
 * - 목적: 페이지 방문 추적 (A/B 그룹별 비교)
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param pageName - 페이지 이름 (예: 'home', 'generate', 'result')
 */
export const logPageView = (
  variant: ImageGenerationVariant,
  pageName: string
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'page_view', {
      ab_variant: variant, // A/B 테스트 그룹
      page_name: pageName, // 페이지 이름
      timestamp: Date.now(), // 방문 시점
    });
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * Tag 버튼 클릭 이벤트
 *
 * 이벤트 정보:
 * - 이벤트명: tag_button_click
 * - 파라미터: ab_variant, tag_type, image_id, timestamp
 * - 목적: Tag 버튼 클릭률 분석 (A/B 그룹별 비교)
 *
 * @param variant - A/B 테스트 그룹 ('single' 또는 'multiple')
 * @param tagType - Tag 타입 (예: 'furniture', 'style', 'color')
 * @param imageId - 이미지 ID (선택사항)
 */
export const logTagButtonClick = (
  variant: ImageGenerationVariant,
  tagType: string,
  imageId?: number
) => {
  if (!analytics) return;

  try {
    logEvent(analytics, 'tag_button_click', {
      ab_variant: variant, // A/B 테스트 그룹
      tag_type: tagType, // Tag 타입
      image_id: imageId, // 이미지 ID
      timestamp: Date.now(), // 클릭 시점
    });
    console.log(`[Analytics] Tag 버튼 클릭: ${tagType} (그룹: ${variant})`);
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
