import { useMutation, useQuery } from '@tanstack/react-query';

import { HTTPMethod, type RequestConfig, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

import { type FloorPlanResponse } from '../types/apis/floorPlan';

import type { UserAddressRequest } from '../types/apis/bottomSheetAddress.types';

// API Functions
// 도면 이미지
export const getFloorPlan = async (): Promise<FloorPlanResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.FLOOR_PLAN,
  };

  return request<FloorPlanResponse['data']>(config);
};

// 사용자 주소 등록
export const postAddress = async (body: UserAddressRequest) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.POST_ADDRESS,
    body,
  });
};

// Query Hooks
export const useFloorPlanQuery = () => {
  return useQuery({
    queryKey: ['floorPlan'],
    queryFn: getFloorPlan,
  });
};

export const useUserAddressMutation = () => {
  return useMutation({
    mutationFn: (body: UserAddressRequest) => postAddress(body),
    onSuccess: () => {
      console.log('주소 등록 성공!');
    },
    onError: (error) => {
      console.error('주소 등록 실패', error);
    },
  });
};
