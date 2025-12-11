import { useQuery } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getMyPageUser,
  getMyPageImages,
  getMyPageImageDetail,
} from '../apis/mypage';

/**
 * 마이페이지 사용자 정보 조회 훅
 */
export const useMyPageUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEY.MYPAGE_USER],
    queryFn: getMyPageUser,
    ...options,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * 마이페이지 이미지 생성 이력 조회 훅
 */
export const useMyPageImages = () => {
  return useQuery({
    queryKey: [QUERY_KEY.MYPAGE_IMAGES],
    queryFn: getMyPageImages,
    staleTime: 15 * 60 * 1000, // 15분 캐시
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * 마이페이지 이미지 상세 조회 훅
 */
type ImageDetailOptions = {
  enabled?: boolean;
  initialData?: () => ReturnType<typeof getMyPageImageDetail>;
};

export const useMyPageImageDetail = (
  houseId: number,
  options?: ImageDetailOptions
) => {
  return useQuery({
    queryKey: [QUERY_KEY.MYPAGE_IMAGE_DETAIL, houseId],
    queryFn: () => getMyPageImageDetail(houseId),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    ...options,
  });
};
