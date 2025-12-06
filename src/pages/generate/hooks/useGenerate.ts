import { useEffect } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { queryClient } from '@/shared/apis/queryClient';
import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getFallbackImage,
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
  deleteResultPreference,
} from '@pages/generate/apis/generate';

import { useABTest } from './useABTest';
import { useGenerateStore } from '../stores/useGenerateStore';

import type {
  CarouselItem,
  GenerateImageData,
  GenerateImageRequest,
} from '@pages/generate/types/generate';

export const useStackData = (
  page: number,
  options: {
    enabled: boolean;
    onSuccess?: (data: CarouselItem[]) => void;
    onError?: (err: unknown) => void;
  }
) => {
  const query = useQuery<CarouselItem[], unknown>({
    queryKey: [QUERY_KEY.GENERATE_LOADING, page],
    queryFn: () => getStackData(page),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: options.enabled,
  });
  // v5에서는 onSuccess/onError가 제거됨: effect로 래핑
  useEffect(() => {
    if (query.isSuccess && query.data) {
      options.onSuccess?.(query.data);
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    if (query.isError) {
      options.onError?.(query.error);
    }
  }, [query.isError, query.error]);

  return query;
};

export const useGetResultDataQuery = (
  houseId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QUERY_KEY.GENERATE_RESULT, houseId],
    queryFn: () => getResultData(houseId),
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
    onSuccess: () => {
      // console.log('sendPreference 성공');
    },
    // onError: (error) => {
    //   console.log('sendPreference 실패:', error);
    // },
  });
};

// 결과 이미지 선호도 취소용 (DELETE)
export const useDeleteResultPreferenceMutation = () => {
  return useMutation({
    mutationFn: (imageId: number) => deleteResultPreference(imageId),
    onSuccess: () => {
      // console.log('deletePreference 성공');
    },
    // onError: (error) => {
    //   console.log('deletePreference 실패:', error);
    // },
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
  const { isMultipleImages } = useABTest();

  const generateImageRequest = useMutation<
    { imageInfoResponses: GenerateImageData[] },
    Error,
    GenerateImageRequest
  >({
    mutationFn: async (userInfo: GenerateImageRequest) => {
      // console.log('이미지 제작 시작:', new Date().toLocaleTimeString());
      // console.log('A/B 테스트 그룹:', variant);

      if (isMultipleImages) {
        // console.log('다중 이미지 생성 API 호출');
        const res = await postGenerateImages(userInfo);
        return res; // 이미 { imageInfoResponses: [...] } 형태
      } else {
        // console.log('단일 이미지 생성 API 호출');
        const res = await postGenerateImage(userInfo);
        // 단일 이미지를 배열로 감싸 통일
        return { imageInfoResponses: [res] };
      }
    },
    onSuccess: (data) => {
      // console.log('이미지 제작 완료:', new Date().toLocaleTimeString());
      // console.log('생성된 이미지 데이터 보기', data);
      // const derivedType =
      //   (data?.imageInfoResponses?.length ?? 0) > 1 ? 'multiple' : 'single';
      // console.log('생성된 이미지 타입:', derivedType);
      resetGenerate();

      setNavigationData(data);
      setApiCompleted(true);

      // console.log('프로그래스 바 완료 대기 중...');
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    },
  });

  return generateImageRequest;
};

// 이미지 생성 폴백
export const useFallbackImage = (
  houseId: number,
  enabled: boolean,
  onError?: (error: unknown) => void // 쿼리문에서 에러 발생 시 전달받은 에러 핸들러(handleError()) 실행
) => {
  const navigate = useNavigate();
  const { resetGenerate, setApiCompleted, setNavigationData } =
    useGenerateStore();

  const query = useQuery({
    queryKey: ['fallbackImage', houseId],
    queryFn: () => getFallbackImage(houseId),
    enabled,
    retry: (failureCount, error: any) => {
      // failureCount는 Tanstack-Query 내부적으로 관리되는 값, retry마다 1씩 증가
      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      // 최대 10번까지만 재시도
      if (failureCount >= 10) {
        console.error('폴백 API 최대 재시도 횟수 초과 (10회)');
        return false;
      }

      if (
        status === 429 ||
        code === 40900 ||
        code === 42900 ||
        code === 42901
      ) {
        // console.log(
        //   `폴백 API 대기 중 (${status || code}): 재시도 ${failureCount + 1}/10`
        // );
        return true; // 계속 재시도
      }

      // 그 외 진짜 에러는 재시도 안 함
      // console.error('폴백 API 진짜 에러 발생:', error);
      return false;
    },
    retryDelay: 5000, // 5초 간격 재시도
  });

  // 성공 시 처리
  useEffect(() => {
    if (query.isSuccess && query.data) {
      resetGenerate();

      // API 완료 신호 및 네비게이션 데이터를 Zustand store에 저장
      setNavigationData(query.data);
      setApiCompleted(true);

      // console.log('폴백 이미지 생성 성공:', query.data);
      // console.log('프로그래스 바 완료 대기 중...');

      // 프로그래스 바 완료 후 이동하도록 변경
      queryClient.invalidateQueries({ queryKey: ['generateImage'] });
    }
  }, [query.isSuccess, query.data]);

  // 에러 시 처리
  useEffect(() => {
    if (query.isError) {
      // console.log('폴백 API 이미지 생성 실패:', query.error);
      // 외부에서 전달받은 에러 핸들러 실행 (없으면 기본 동작)
      if (onError) {
        onError(query.error);
      } else {
        navigate(ROUTES.HOME);
      }
    }
  }, [query.isError, query.error, onError]);

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
    onSuccess: () => {
      // console.log('sendFactorPreference 성공');
    },
    onError: () => {
      // console.error('sendFactorPreference 실패:', error);
    },
  });
};
