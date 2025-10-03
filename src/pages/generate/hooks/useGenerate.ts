import { useEffect } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@/shared/apis/queryClient';
import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getCheckGenerateImageStatus,
  postGenerateImage,
  postGenerateImages,
  getResultData,
  getStackData,
  postCreditLog,
  postFurnitureLog,
  postStackHate,
  postStackLike,
  postResultPreference,
  getPreferFactors,
  postFactorPreference,
} from '@pages/generate/apis/generate';

import { useABTest } from './useABTest';
import { useGenerateStore } from '../stores/useGenerateStore';

import type {
  GenerateImageData,
  GenerateImageRequest,
} from '@pages/generate/types/generate';

export const useStackData = (page: number, options: { enabled: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_LOADING, page],
    queryFn: () => getStackData(page),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useGetResultDataQuery = (
  imageId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_RESULT, imageId],
    queryFn: () => getResultData(imageId),
    ...options,
  });
};

// 캐러셀 이미지 좋아요/별로예요
export const usePostCarouselLikeMutation = () => {
  return useMutation({
    mutationFn: postStackLike,
  });
};

export const usePostCarouselHateMutation = () => {
  return useMutation({
    mutationFn: postStackHate,
  });
};

// 결과 이미지 선호도 전송용 (POST)
export const useResultPreferenceMutation = () => {
  return useMutation({
    mutationFn: ({ imageId, isLike }: { imageId: number; isLike: boolean }) =>
      postResultPreference(imageId, isLike),
  });
};

// 생성된 이미지 좋아요 여부에 따란 요인 문구
export const useFactorsQuery = (
  isLike: boolean,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_FACTORS, isLike],
    queryFn: () => getPreferFactors(isLike),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    ...options,
  });
};

// 가구 추천 받기 버튼 클릭 로그
export const useFurnitureLogMutation = () => {
  return useMutation({
    mutationFn: postFurnitureLog,
  });
};

// 결제 모달 버튼 클릭 로그 확인
export const useCreditLogMutation = () => {
  return useMutation({
    mutationFn: postCreditLog,
  });
};

// 이미지 생성 api (A/B 테스트 적용)
export const useGenerateImageApi = () => {
  const { setApiCompleted, setNavigationData, resetGenerate } =
    useGenerateStore();
  const { variant, isSingleImage, isMultipleImages } = useABTest();

  const generateImageRequest = useMutation<
    { imageInfoResponses: GenerateImageData[] },
    Error,
    GenerateImageRequest
  >({
    mutationFn: async (userInfo: GenerateImageRequest) => {
      console.log('이미지 제작 시작:', new Date().toLocaleTimeString());
      console.log('A/B 테스트 그룹:', variant);

      if (isMultipleImages) {
        console.log('다중 이미지 생성 API 호출');
        const res = await postGenerateImages(userInfo);
        return res; // 이미 { imageInfoResponses: [...] } 형태
      } else {
        console.log('단일 이미지 생성 API 호출');
        const res = await postGenerateImage(userInfo);
        // 단일 이미지를 배열로 감싸 통일
        return { imageInfoResponses: [res] };
      }
    },
    onSuccess: (data) => {
      console.log('이미지 제작 완료:', new Date().toLocaleTimeString());
      console.log('생성된 이미지 데이터 보기', data);
      const derivedType =
        (data?.imageInfoResponses?.length ?? 0) > 1 ? 'multiple' : 'single';
      console.log('생성된 이미지 타입:', derivedType);
      resetGenerate();

      setNavigationData(data);
      setApiCompleted(true);

      console.log('프로그래스 바 완료 대기 중...');
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    },
  });

  return generateImageRequest;
};

// 이미지 생성 폴백
export const useGenerateImageStatusCheck = (
  houseId: number,
  shouldStart: boolean
) => {
  const navigate = useNavigate();
  const { resetGenerate, setApiCompleted, setNavigationData } =
    useGenerateStore();

  const query = useQuery({
    queryKey: ['generateImageStatus', houseId],
    queryFn: () => getCheckGenerateImageStatus(houseId),
    enabled: shouldStart,
    refetchInterval: 7000, // 5초
    refetchIntervalInBackground: true,
    retry: (failureCount) => {
      // 최대 10번 재시도
      if (failureCount >= 9) {
        console.error('최대 재시도 횟수 초과');
        return false;
      }
      console.log(`상태 체크 재시도 ${failureCount + 1}/10`);
      return true;
    },
  });

  // 성공 시 처리, useGenerateImageStatusCheck 커스텀 훅이 LoadingPage에서 호출되면 useEffect()가 계속 상태 체크
  useEffect(() => {
    if (query.isSuccess && query.data) {
      resetGenerate();

      // API 완료 신호 및 네비게이션 데이터를 Zustand store에 저장
      setNavigationData(query.data);
      setApiCompleted(true);

      console.log('상태 체크 성공:', query.data);
      console.log('프로그래스 바 완료 대기 중...');

      // 프로그래스 바 완료 후 이동하도록 변경 (navigate 제거)
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    }
  }, [query.isSuccess, query.data]);

  // 에러 시 처리
  useEffect(() => {
    if (query.isError) {
      navigate('/imageSetup');
      console.log('fallback api 이미지 생성 실패');
    }
  }, [query.isError, query.error]);

  return query;
};

// 요인 선택 mutation
export const useFactorPreferenceMutation = () => {
  return useMutation({
    mutationFn: ({
      imageId,
      factorId,
    }: {
      imageId: number;
      factorId: number;
    }) => postFactorPreference(imageId, factorId),
  });
};
