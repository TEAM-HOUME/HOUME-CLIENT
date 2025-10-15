import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type {
  GenerateImageRequest,
  GenerateImageAResponse,
  GenerateImageBResponse,
  CarouselItem,
  ImageStackResponse,
  FactorsResponse,
} from '@pages/generate/types/generate';

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
export const getResultData = async (houseId: number) => {
  return request({
    method: HTTPMethod.GET,
    url: `${API_ENDPOINT.GENERATE.IMAGE_PREFERENCE}/${houseId}/preference`,
  });
};

// 생성된 이미지 선호도 전송
export const postResultPreference = async (
  imageId: number,
  isLike: boolean
) => {
  return request({
    method: HTTPMethod.POST,
    url: `${API_ENDPOINT.GENERATE.IMAGE_PREFERENCE}/${imageId}/preference`,
    body: {
      isLike,
    },
  });
};

// 생성된 이미지 선호도 선택 해제 (취소)
export const deleteResultPreference = async (imageId: number) => {
  return request({
    method: HTTPMethod.DELETE,
    url: `${API_ENDPOINT.GENERATE.IMAGE_PREFERENCE}/${imageId}/preference`,
  });
};

// 생성된 이미지 좋아요 여부에 따란 요인 문구
export const getPreferFactors = async (isLike: boolean) => {
  const res = await request<FactorsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.FACTORS,
    query: { isLike },
  });
  return res?.factors || [];
};

// 사용자가 특정 요인을 선택했을 때 서버에 전송
export const postFactorPreference = async (
  imageId: number,
  factorId: number
) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.FACTOR_PREFERENCE(imageId, factorId),
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

// 이미지 생성 api - A안 (여러 이미지 생성)
export const postGenerateImages = async (
  requestData: GenerateImageRequest
): Promise<GenerateImageAResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.IMAGE_V3,
    body: requestData,
  };

  return await request<GenerateImageAResponse['data']>(config);
};

// 이미지 생성 api - B안 (단일 이미지 생성)
export const postGenerateImage = async (
  requestData: GenerateImageRequest
): Promise<GenerateImageBResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.IMAGE_V2,
    body: requestData,
  };

  return await request<GenerateImageBResponse['data']>(config);
};

// 이미지 생성 폴백 api
export const getCheckGenerateImageStatus = async (
  houseId: number
): Promise<GenerateImageBResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: `${API_ENDPOINT.GENERATE.IMAGE_STATUS}?houseId=${houseId}`,
  };

  return await request<GenerateImageBResponse['data']>(config);
};
