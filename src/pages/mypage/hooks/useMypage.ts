import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getMyPageUser,
  getMyPageImages,
  getMyPageImageDetail,
} from '../apis/mypage';

import type { MyPageImageDetailData } from '../types/apis/MyPage';

type QueryResult<T> = Awaited<T>;
type UseQueryBaseOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData>,
  'queryKey' | 'queryFn'
>;

/**
 * 마이페이지 사용자 정보 조회 훅
 */
type UseMyPageUserOptions = UseQueryBaseOptions<
  QueryResult<ReturnType<typeof getMyPageUser>>
>;

export const useMyPageUser = (options?: UseMyPageUserOptions) => {
  return useQuery<QueryResult<ReturnType<typeof getMyPageUser>>>({
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
type UseMyPageImagesOptions = UseQueryBaseOptions<
  QueryResult<ReturnType<typeof getMyPageImages>>
>;

export const useMyPageImages = (options?: UseMyPageImagesOptions) => {
  return useQuery<QueryResult<ReturnType<typeof getMyPageImages>>>({
    queryKey: [QUERY_KEY.MYPAGE_IMAGES],
    queryFn: getMyPageImages,
    staleTime: 15 * 60 * 1000, // 15분 캐시
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * 마이페이지 이미지 상세 조회 훅
 */
type ImageDetailResult = MyPageImageDetailData;
type ImageDetailOptions = UseQueryBaseOptions<ImageDetailResult>;

export const useMyPageImageDetail = (
  houseId: number,
  options?: ImageDetailOptions
) => {
  return useQuery<ImageDetailResult>({
    queryKey: [QUERY_KEY.MYPAGE_IMAGE_DETAIL, houseId],
    queryFn: () => getMyPageImageDetail(houseId),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    ...options,
  });
};
