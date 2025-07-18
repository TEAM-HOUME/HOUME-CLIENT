import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  generateImage,
  getResultData,
  getStackData,
  postCreditLog,
  postFurnitureLog,
  postHateStack,
  postLikeStack,
  postPreference,
} from '../apis/generate';
import type { GenerateImageRequest } from '../types/GenerateType';
import { QUERY_KEY } from '@/shared/constants/queryKey';
import { queryClient } from '@/shared/apis/queryClient';
import { useFunnelStore } from '@/pages/onboarding/stores/useFunnelStore';

export const useStackData = (page: number, options: { enabled: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_LOADING, page],
    queryFn: () => getStackData(page),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useResultData = (imageId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_RESULT, imageId],
    queryFn: () => getResultData(imageId),
  });
};

// 캐러셀 이미지 좋아요/별로예요
export const useLikeStackMutation = () => {
  return useMutation({
    mutationFn: postLikeStack,
  });
};

export const useHateStackMutation = () => {
  return useMutation({
    mutationFn: postHateStack,
  });
};

// 결과 이미지 선호도 전송용 (POST)
export const usePreferenceMutation = () => {
  return useMutation({
    mutationFn: ({ imageId, isLike }: { imageId: number; isLike: boolean }) =>
      postPreference(imageId, isLike),
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
  const navigate = useNavigate();
  const { resetFunnel } = useFunnelStore();

  const generateImageRequest = useMutation({
    mutationFn: (userInfo: GenerateImageRequest) => generateImage(userInfo),
    onSuccess: (data) => {
      console.log('이미지 생성 요청 결과: ', data);
      // 성공 시 자동으로 ResultPage로 이동
      navigate('/generate/result', {
        state: {
          result: data,
        },
        replace: true,
      });
      resetFunnel(); // 성공 시에도 초기화
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    },
  });

  return generateImageRequest;
};
