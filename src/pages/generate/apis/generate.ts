import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { CarouselItem, ImageStackResponse } from '../types/generate';
import type {
  GenerateImageRequest,
  GenerateImageResponse,
} from '../types/generate';
import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';

// 스택 UI
// 캐러셀 가구 이미지 제공
export const getStackData = async (page: number): Promise<CarouselItem[]> => {
  const res = await request<ImageStackResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CAROUSELS,
    query: { page },
  });
  return res.carouselResponseDTOS ?? [];
};

// 캐러셀 이미지 좋아요 / 별로예요
export const postStackLike = async (carouselId: number) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.CAROUSELS_LIKE,
    query: {
      carouselId,
    },
  });
};

export const postStackHate = async (carouselId: number) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.CAROUSELS_HATE,
    query: {
      carouselId,
    },
  });
};

// 생성 결과
// 생성된 이미지 조회
export const getResultData = async (imageId: number) => {
  return request({
    method: HTTPMethod.GET,
    url: `${API_ENDPOINT.GENERATE.IMAGE_PREFERENCE}/${imageId}/preference`,
  });
};

// 생성된 이미지 선호 여부
export const postPreference = async (imageId: number, isLike: boolean) => {
  return request({
    method: HTTPMethod.POST,
    url: `${API_ENDPOINT.GENERATE.IMAGE_PREFERENCE}/${imageId}/preference`,
    body: {
      isLike,
    },
  });
};

// 가구 추천 받기 버튼 클릭 로그 확인
export const postFurnitureLog = async () => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.ANALYTICS.FURNITURE_LOGS,
  });
};

// 결제 모달 버튼 클릭 로그 확인
export const postCreditLog = async () => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.ANALYTICS.CREDIT_LOGS,
  });
};

// 이미지 생성 api
export const generateImage = async (
  requestData: GenerateImageRequest
): Promise<GenerateImageResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.IMAGE_V2,
    body: requestData,
  };

  return await request<GenerateImageResponse['data']>(config);
};

// 이미지 생성 폴백 api
export const checkGenerateImageStatus = async (
  houseId: number
): Promise<GenerateImageResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: `${API_ENDPOINT.GENERATE.IMAGE_STATUS}?houseId=${houseId}`,
  };

  return await request<GenerateImageResponse['data']>(config);
};
