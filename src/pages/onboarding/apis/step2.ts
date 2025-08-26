import { API_URL } from '@constants/apiEndpoints';
import { type FloorPlanResponse } from '../types/apis/step2Api.types';
import { HTTPMethod, type RequestConfig, request } from '@/shared/apis/request';

export const getFloorPlan = async (): Promise<FloorPlanResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: API_URL.ONBOARDING.HOUSE_TEMPLATES,
  };

  return await request<FloorPlanResponse['data']>(config);
};
