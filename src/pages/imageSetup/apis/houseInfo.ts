import { useMutation, useQuery } from '@tanstack/react-query';

import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

import type {
  HousingOptionsResponse,
  HousingSelectionRequest,
  HousingSelectionResponse,
} from '../types/apis/houseInfo';

// API Functions
export const getHousingOptions = async () => {
  return request<HousingOptionsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_OPTIONS,
  });
};

const postHousingSelection = async (requestData: HousingSelectionRequest) => {
  return request<HousingSelectionResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_INFO,
    body: requestData,
  });
};

// Query Hooks
export const useHousingOptionsQuery = () => {
  return useQuery({
    queryKey: ['housing-options'], // prefetching한 쿼리와 같은 QueryKey값으로 설정, 캐시에서 데이터 조회
    queryFn: getHousingOptions,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useHousingSelectionMutation = () => {
  return useMutation({
    mutationFn: postHousingSelection,
    // 훅 호출부에서 onSuccess, onError 콜백 처리
  });
};
