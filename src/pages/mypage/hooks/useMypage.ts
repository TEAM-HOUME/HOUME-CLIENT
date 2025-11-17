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
    staleTime: 0,
  });
};

/**
 * 마이페이지 이미지 생성 이력 조회 훅
 */
export const useMyPageImages = () => {
  return useQuery({
    queryKey: [QUERY_KEY.MYPAGE_IMAGES],
    queryFn: getMyPageImages,
    staleTime: 0,
  });
};

/**
 * 마이페이지 이미지 상세 조회 훅
 */
export const useMyPageImageDetail = (
  houseId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QUERY_KEY.MYPAGE_IMAGE_DETAIL, houseId],
    queryFn: () => getMyPageImageDetail(houseId),
    staleTime: 0,
    ...options,
  });
};
