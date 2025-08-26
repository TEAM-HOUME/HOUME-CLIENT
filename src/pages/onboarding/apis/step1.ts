import { API_ENDPOINT } from '@constants/apiEndpoints';
import type {
  SelectHouseInfoRequest,
  SelectHouseInfoResponse,
} from '../types/apis/step1Api.types';
import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';

export const selectHouseInfo = async (
  requestData: SelectHouseInfoRequest
): Promise<SelectHouseInfoResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: API_ENDPOINT.ONBOARDING.HOUSING_SELECTIONS,
    body: requestData,
  };

  return await request<SelectHouseInfoResponse['data']>(config);
};
