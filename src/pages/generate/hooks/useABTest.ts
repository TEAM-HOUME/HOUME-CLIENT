// Remote Config 값을 읽어 사용자를 single 또는 multiple 그룹으로 분리하는 커스텀 훅

import { useEffect, useMemo, useState } from 'react';

import { fetchAndActivate, getValue } from 'firebase/remote-config';

import { remoteConfig } from '@/shared/config/firebase';

export type ImageGenerationVariant = 'single' | 'multiple';

// 동기적으로 URL/로컬스토리지 오버라이드를 읽는 유틸 (개발 모드에서만 작동)
const readLocalOverride = (): ImageGenerationVariant | null => {
  try {
    const isDev = import.meta.env.DEV;
    if (!isDev) return null;

    const searchParams = new URLSearchParams(window.location.search);
    const urlOverride = searchParams.get('ab');
    const lsOverride = localStorage.getItem('ab_image_variant');

    if (urlOverride === 'single' || urlOverride === 'multiple') {
      localStorage.setItem('ab_image_variant', urlOverride);
      return urlOverride;
    }
    if (lsOverride === 'single' || lsOverride === 'multiple') {
      return lsOverride;
    }
  } catch (_) {
    // noop (예: SSR 환경 대비)
  }
  return null;
};

export const useABTest = () => {
  // 초기 렌더 전에 오버라이드 반영
  const localOverride = useMemo(readLocalOverride, []);

  const [variant, setVariant] = useState<ImageGenerationVariant>(
    localOverride ?? 'single'
  );
  const [isLoading, setIsLoading] = useState(localOverride ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 오버라이드가 있으면 Remote Config를 건너뜀
    if (localOverride) return;

    const initializeABTest = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Firebase Remote Config가 제대로 설정되었는지 확인
        if (!remoteConfig) {
          throw new Error('Firebase Remote Config is not initialized');
        }

        // Remote Config에서 최신 설정 가져오기
        await fetchAndActivate(remoteConfig);

        // A/B 테스트 변수 가져오기
        const configValue = getValue(remoteConfig, 'image_generation_variant');
        const variantValue = configValue.asString() as ImageGenerationVariant;

        // 유효한 값인지 확인
        if (variantValue === 'multiple' || variantValue === 'single') {
          setVariant(variantValue);
          localStorage.setItem('ab_image_variant', variantValue);
          console.log('A/B 테스트 그룹:', variantValue);
        } else {
          console.warn('잘못된 A/B 테스트 값:', variantValue, '기본값 사용');
          setVariant('single');
          localStorage.setItem('ab_image_variant', 'single');
        }
      } catch (err) {
        console.error('A/B 테스트 초기화 실패:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setVariant('single'); // 에러 시 기본값 사용
        localStorage.setItem('ab_image_variant', 'single');
        console.log('기본값으로 설정: single (단일 이미지)');
      } finally {
        setIsLoading(false);
      }
    };

    initializeABTest();
  }, [localOverride]);

  return {
    variant,
    isLoading,
    error,
    isSingleImage: variant === 'single',
    isMultipleImages: variant === 'multiple',
  };
};
