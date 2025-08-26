import { API_ENDPOINT } from '@constants/apiEndpoints';
import type {
  MyPageUserResponse,
  MyPageImagesResponse,
  MyPageImageDetailResponse,
} from '../types/apis/MyPageType';
import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';

/**
 * 마이페이지 기본 정보 조회 API
 * GET /api/v1/mypage/user
 */
export const getMyPageUser = async (): Promise<MyPageUserResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.MYPAGE,
  };

  return await request<MyPageUserResponse['data']>(config);
};

/**
 * 마이페이지 이미지 생성 이력 조회 API
 * GET /api/v1/mypage/images
 */
export const getMyPageImages = async (): Promise<
  MyPageImagesResponse['data']
> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.MYPAGE_IMAGES,
  };

  return await request<MyPageImagesResponse['data']>(config);
};

/**
 * 마이페이지 이미지 상세 조회 API
 * GET /api/v1/mypage/images/{imageId}
 */
export const getMyPageImageDetail = async (
  imageId: number
): Promise<MyPageImageDetailResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: `${API_ENDPOINT.USER.MYPAGE_IMAGE_DETAIL}/${imageId}`,
  };

  return await request<MyPageImageDetailResponse['data']>(config);
};
