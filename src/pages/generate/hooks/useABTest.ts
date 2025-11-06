/**
 * Firebase A/B Testing (Remote Config 기반)으로 사용자를 single 또는 multiple 그룹으로 분리하는 훅
 *
 * Firebase Remote Config 설정:
 * - 매개변수: image_generation_variant
 * - 기본값: 'multiple' (Firebase Console에서 설정)
 * - 조건: generate_single_50 (50% 사용자에게 'single' 반환)
 *
 * 작동 원리:
 * 1. Firebase Remote Config에서 사용자별로 'single' 또는 'multiple' 값을 반환
 * 2. 50% 사용자 → 'single' (GeneratedImgB 컴포넌트 표시)
 * 3. 50% 사용자 → 'multiple' (GeneratedImgA 컴포넌트 표시)
 * 4. Firebase Analytics에 A/B 그룹 정보와 이벤트 전송
 */

import { useEffect, useState } from 'react';

import { fetchAndActivate, getValue } from 'firebase/remote-config';

import { remoteConfig } from '@/shared/config/firebase';
import { logABTestAssignment, setABTestGroup } from '@/shared/utils/analytics';

/** A/B 테스트에서 사용하는 이미지 생성 타입 */
export type ImageGenerationVariant = 'single' | 'multiple';

/**
 * Firebase Remote Config 기반 A/B 테스트 훅
 *
 * @returns {Object} A/B 테스트 관련 상태와 헬퍼 함수들
 * @returns {ImageGenerationVariant} variant - 현재 사용자의 A/B 그룹 ('single' | 'multiple')
 * @returns {boolean} isLoading - Firebase에서 값을 가져오는 중인지 여부
 * @returns {string | null} error - 에러 발생 시 에러 메시지
 * @returns {boolean} isSingleImage - variant === 'single'인지 여부
 * @returns {boolean} isMultipleImages - variant === 'multiple'인지 여부
 */
export const useABTest = () => {
  /** localStorage에서 캐시된 값으로 초기값 설정 */
  const getInitialVariant = (): ImageGenerationVariant => {
    try {
      const cached = localStorage.getItem('ab_image_variant');
      if (cached === 'single' || cached === 'multiple') {
        return cached;
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
    return 'single'; // 기본값
  };

  /** 현재 사용자의 A/B 테스트 그룹 */
  const [variant, setVariant] =
    useState<ImageGenerationVariant>(getInitialVariant());
  /** Firebase Remote Config에서 값을 가져오는 중인지 여부 */
  const [isLoading, setIsLoading] = useState(true);
  /** 에러 발생 시 에러 메시지 */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Firebase Remote Config에서 A/B 테스트 그룹을 가져와서 초기화하는 함수
     *
     * 실행 순서:
     * 1. localStorage 캐시 확인 (최우선)
     * 2. 개발 모드 URL 파라미터 체크
     * 3. Firebase Remote Config에서 값 가져오기
     * 4. Firebase Analytics에 그룹 정보 전송
     * 5. 에러 시 fallback 로직 실행
     */
    const initializeABTest = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1️⃣ localStorage 캐시 확인 (페이지 이동 후에도 값 유지)
        try {
          const cachedVariant = localStorage.getItem('ab_image_variant');
          if (cachedVariant === 'single' || cachedVariant === 'multiple') {
            console.log('💾 [캐시 확인] 저장된 그룹 사용:', cachedVariant);
            setVariant(cachedVariant);
            setABTestGroup(cachedVariant);
            // 캐시된 값이 있으면 즉시 반환 (중복 Analytics 이벤트 방지)
            // 단, 개발 모드에서 URL 파라미터가 있으면 URL 파라미터 우선
            if (
              !import.meta.env.DEV ||
              !window.location.search.includes('?ab=')
            ) {
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // localStorage 접근 실패 시 무시하고 계속 진행
        }

        // 2️⃣ 개발 모드: URL 파라미터로 강제 설정 가능
        // 예: localhost:3000?ab=single 또는 ?ab=multiple
        if (import.meta.env.DEV) {
          const searchParams = new URLSearchParams(window.location.search);
          const urlOverride = searchParams.get('ab');
          if (urlOverride === 'single' || urlOverride === 'multiple') {
            console.log('🔧 [개발 모드] URL에서 그룹 강제 설정:', urlOverride);
            setVariant(urlOverride);
            setABTestGroup(urlOverride); // Firebase Analytics에 사용자 속성 설정
            logABTestAssignment(urlOverride, false); // A/B 테스트 할당 이벤트 로깅
            // localStorage에도 저장
            try {
              localStorage.setItem('ab_image_variant', urlOverride);
            } catch {
              console.warn('localStorage 저장 실패');
            }
            setIsLoading(false);
            return; // 개발 모드에서는 Firebase Remote Config 건너뛰기
          }
        }

        // Firebase Remote Config 초기화 확인
        if (!remoteConfig) {
          throw new Error('Firebase Remote Config is not initialized');
        }

        // Firebase에서 최신 A/B 테스트 설정 가져오기
        // fetchAndActivate: 서버에서 최신 설정을 가져와서 활성화
        const activated = await fetchAndActivate(remoteConfig);
        console.log(
          '🔥 Firebase Remote Config 활성화:',
          activated ? '새 값' : '캐시된 값'
        );

        // Firebase에서 최신 A/B 테스트 설정 가져오기
        // Firebase가 할당한 A/B 그룹 가져오기
        // Firebase Console의 'image_generation_variant' 매개변수에서 값 가져오기
        // - 기본값: 'multiple'
        // - 조건 generate_single_50 만족 시: 'single'
        const configValue = getValue(remoteConfig, 'image_generation_variant');
        const fbVariant = configValue.asString() as ImageGenerationVariant;

        console.log('📊 Firebase A/B Testing 그룹 할당:', fbVariant);

        // 유효성 검증
        if (fbVariant === 'single' || fbVariant === 'multiple') {
          // localStorage에 저장된 값과 비교하여 중복 Analytics 이벤트 방지
          const cachedVariant = localStorage.getItem('ab_image_variant');
          const isNewAssignment = cachedVariant !== fbVariant;

          setVariant(fbVariant);

          // Firebase Analytics에 A/B 그룹 정보 전송 (새로 할당된 경우에만)
          setABTestGroup(fbVariant); // 사용자 속성은 항상 업데이트
          if (isNewAssignment) {
            logABTestAssignment(fbVariant, true); // ab_test_assigned 이벤트 로깅 (새 할당만)
            console.log('[Firebase] 새로운 A/B 그룹 할당:', fbVariant);
          } else {
            console.log('[Firebase] 기존 그룹 유지:', fbVariant);
          }

          // 로컬 캐시에도 저장 (fallback용)
          try {
            localStorage.setItem('ab_image_variant', fbVariant);
          } catch {
            console.warn('localStorage 저장 실패');
          }
        } else {
          console.warn('잘못된 A/B 테스트 값:', fbVariant);
          throw new Error('Invalid variant from Firebase');
        }
      } catch (err) {
        console.error('Firebase A/B Testing 초기화 실패:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback 로직: Firebase 연결 실패 시 대비
        try {
          const cachedVariant = localStorage.getItem('ab_image_variant');
          if (cachedVariant === 'single' || cachedVariant === 'multiple') {
            console.log('Fallback: 캐시된 그룹 사용:', cachedVariant);
            setVariant(cachedVariant);
            setABTestGroup(cachedVariant);
          } else {
            // 최종 fallback: 기본값 사용
            console.log('Fallback: 기본 그룹(single) 사용');
            setVariant('single');
            setABTestGroup('single');
            localStorage.setItem('ab_image_variant', 'single');
          }
        } catch {
          console.error('Fallback도 실패, 기본값 사용');
        }
      } finally {
        setIsLoading(false); // 로딩 상태 해제
      }
    };

    initializeABTest();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return {
    /** 현재 사용자의 A/B 테스트 그룹 ('single' | 'multiple') */
    variant,
    /** Firebase Remote Config에서 값을 가져오는 중인지 여부 */
    isLoading,
    /** 에러 발생 시 에러 메시지 */
    error,
    /** variant === 'single'인지 여부 (GeneratedImgB 컴포넌트 표시) */
    isSingleImage: variant === 'single',
    /** variant === 'multiple'인지 여부 (GeneratedImgA 컴포넌트 표시) */
    isMultipleImages: variant === 'multiple',
  };
};
