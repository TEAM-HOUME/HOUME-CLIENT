import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  HousingOptionsResponse,
  HousingSelectionRequest,
  HousingSelectionResponse,
} from '../types/apis/houseInfo';
import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

// API Functions
const getHousingOptions = async (): Promise<HousingOptionsResponse> => {
  return await request<HousingOptionsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_OPTIONS,
  });
};

const postHousingSelection = async (
  requestData: HousingSelectionRequest
): Promise<HousingSelectionResponse> => {
  return await request<HousingSelectionResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_INFO,
    body: requestData,
  });
};

// Query Hooks
export const useHousingOptionsQuery = () => {
  return useQuery({
    queryKey: ['housing-options'], // App.tsx에서 호출한 쿼리와 같은 QueryKey값으로 캐시에서 조회
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
