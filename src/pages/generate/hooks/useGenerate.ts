import { useEffect } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useFunnelStore } from '@/pages/imageSetup/stores/useFunnelStore';
import { queryClient } from '@/shared/apis/queryClient';
import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getCheckGenerateImageStatus,
  postGenerateImage,
  getResultData,
  getStackData,
  postCreditLog,
  postFurnitureLog,
  postStackHate,
  postStackLike,
  postResultPreference,
} from '@pages/generate/apis/generate';

import { useGenerateStore } from '../stores/useGenerateStore';

import type { GenerateImageRequest } from '@pages/generate/types/generate';

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

// 이미지 생성 api
export const useGenerateImageApi = () => {
  // const queryClient = useQueryClient();
  const { resetFunnel } = useFunnelStore();
  const { setApiCompleted, setNavigationData, resetGenerate } =
    useGenerateStore();

  const generateImageRequest = useMutation({
    mutationFn: (userInfo: GenerateImageRequest) => {
      console.log('🚀 이미지 제작 시작:', new Date().toLocaleTimeString());
      return postGenerateImage(userInfo);
    },
    onSuccess: (data) => {
      console.log('✅ 이미지 제작 완료:', new Date().toLocaleTimeString());
      resetGenerate();

      // API 완료 신호 및 네비게이션 데이터를 Zustand store에 저장
      setNavigationData(data);
      setApiCompleted(true);

      // 프로그래스 바 완료 후 이동하도록 변경 (navigate 제거)
      console.log('🔄 프로그래스 바 완료 대기 중...');

      resetFunnel(); // 성공 시에도 초기화
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
  const { resetFunnel } = useFunnelStore();
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
      console.log('🔄 프로그래스 바 완료 대기 중...');

      // 프로그래스 바 완료 후 이동하도록 변경 (navigate 제거)
      resetFunnel();
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    }
  }, [query.isSuccess, query.data, resetFunnel]);

  // 에러 시 처리
  useEffect(() => {
    if (query.isError) {
      navigate('/imageSetup');
      console.log('fallback api 이미지 생성 실패');
    }
  }, [query.isError, query.error]);

  return query;
};
