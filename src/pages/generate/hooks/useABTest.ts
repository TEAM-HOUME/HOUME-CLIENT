/**
 * 사용자 ID 기반 A/B Testing으로 사용자를 single 또는 multiple 그룹으로 분리하는 훅
 *
 * 1. userId를 기반으로 그룹 배정 (홀수: single, 짝수: multiple)
 * 2. 같은 userId는 항상 같은 그룹에 배정 (기기/브라우저와 무관)
 * 3. Firebase Analytics에 A/B 그룹 정보와 이벤트 전송
 */

import { useEffect, useState } from 'react';

import { logABTestAssignment, setABTestGroup } from '@/shared/utils/analytics';
import { useUserStore } from '@/store/useUserStore';

export type ImageGenerationVariant = 'single' | 'multiple';

/**
 * 개발 모드에서 A/B 그룹을 고정하기 위한 값
 * 'single' 또는 'multiple'로 설정하면 개발 모드에서 항상 해당 그룹으로 고정됨
 * null로 설정하면 userId 기반 로직 사용
 */
const DEV_FIXED_VARIANT: ImageGenerationVariant | null = import.meta.env.DEV
  ? null // 'single' 또는 'multiple'로 변경하여 고정 가능
  : null;

/**
 * userId 기반으로 A/B 테스트 그룹 결정
 * 홀수: single, 짝수: multiple (50:50 분할)
 * @param userId 사용자 ID
 * @returns 'single' 또는 'multiple'
 */
const getVariantFromUserId = (userId: number): ImageGenerationVariant => {
  return userId % 2 === 1 ? 'single' : 'multiple';
};

/**
 * 사용자 ID 기반 A/B 테스트 훅
 *
 * @returns {Object} A/B 테스트 관련 상태와 헬퍼 함수들
 * @returns {ImageGenerationVariant} variant - 현재 사용자의 A/B 그룹 ('single' | 'multiple')
 * @returns {boolean} isLoading - 그룹 배정 중인지 여부
 * @returns {string | null} error - 에러 발생 시 에러 메시지
 * @returns {boolean} isSingleImage - variant === 'single'인지 여부
 * @returns {boolean} isMultipleImages - variant === 'multiple'인지 여부
 */
export const useABTest = () => {
  const userId = useUserStore((state) => state.userId);

  /** 초기값 설정: 개발 모드 하드코딩 값 우선 - 없으면 localStorage - 없으면 'multiple' */
  const getInitialVariant = (): ImageGenerationVariant => {
    if (DEV_FIXED_VARIANT) {
      return DEV_FIXED_VARIANT;
    }
    try {
      const cached = localStorage.getItem('ab_image_variant');
      if (cached === 'single' || cached === 'multiple') {
        return cached;
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
    return 'multiple';
  };

  /** 현재 사용자의 A/B 테스트 그룹 */
  const [variant, setVariant] =
    useState<ImageGenerationVariant>(getInitialVariant());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * userId 기반으로 A/B 테스트 그룹을 배정하는 함수
     *
     * 1. 개발 모드 하드코딩 값 체크 (최우선)
     * 2. userId 기반으로 그룹 배정
     * 3. Firebase Analytics에 그룹 정보 전송
     * 4. 에러 시 fallback 로직 실행
     */
    const initializeABTest = () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. 개발 모드 하드코딩 값으로 그룹 설정
        if (DEV_FIXED_VARIANT) {
          // console.log(
          //   '[개발 모드] 하드코딩된 A/B 그룹 설정:',
          //   DEV_FIXED_VARIANT
          // );
          setVariant(DEV_FIXED_VARIANT);
          setABTestGroup(DEV_FIXED_VARIANT);
          logABTestAssignment(DEV_FIXED_VARIANT, false);
          setIsLoading(false);
          return;
        }

        // 2. userId 기반으로 그룹 배정
        if (userId !== null && userId !== undefined) {
          const assignedVariant = getVariantFromUserId(userId);
          // console.log(
          //   `[userId 기반] 그룹 배정: userId=${userId} → ${assignedVariant}`
          // );

          // localStorage에 저장된 값과 비교하여 중복 Analytics 이벤트 방지
          const cachedVariant = localStorage.getItem('ab_image_variant');
          const isNewAssignment = cachedVariant !== assignedVariant;

          setVariant(assignedVariant);

          // Firebase Analytics에 A/B 그룹 정보 전송
          setABTestGroup(assignedVariant);
          if (isNewAssignment) {
            logABTestAssignment(assignedVariant, true);
            // console.log('[userId 기반] 새로운 A/B 그룹 할당:', assignedVariant);
          } else {
            // console.log('[userId 기반] 기존 그룹 유지:', assignedVariant);
          }

          // localStorage에 저장 (fallback용)
          try {
            localStorage.setItem('ab_image_variant', assignedVariant);
          } catch {
            // console.warn('localStorage 저장 실패');
          }
        } else {
          // userId가 없는 경우 (비로그인 사용자)
          // console.warn('userId가 없어 기본 그룹(multiple) 사용');
          const defaultVariant: ImageGenerationVariant = 'multiple';
          setVariant(defaultVariant);
          setABTestGroup(defaultVariant);
          try {
            localStorage.setItem('ab_image_variant', defaultVariant);
          } catch {
            // console.warn('localStorage 저장 실패');
          }
        }
      } catch (err) {
        console.error('A/B 테스트 초기화 실패:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback 로직
        try {
          const cachedVariant = localStorage.getItem('ab_image_variant');
          if (cachedVariant === 'single' || cachedVariant === 'multiple') {
            // console.log('Fallback: 캐시된 그룹 사용:', cachedVariant);
            setVariant(cachedVariant);
            setABTestGroup(cachedVariant);
          } else {
            // console.log('Fallback: 기본 그룹(multiple) 사용');
            const defaultVariant: ImageGenerationVariant = 'multiple';
            setVariant(defaultVariant);
            setABTestGroup(defaultVariant);
            localStorage.setItem('ab_image_variant', defaultVariant);
          }
        } catch {
          console.error('Fallback 실패, 기본값 사용');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeABTest();
  }, [userId]);

  return {
    variant,
    isLoading,
    error,
    isSingleImage: variant === 'single',
    isMultipleImages: variant === 'multiple',
  };
};
