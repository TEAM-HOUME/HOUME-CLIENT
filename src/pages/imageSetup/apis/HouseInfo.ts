import type {
  SelectHouseInfoRequest,
  SelectHouseInfoResponse,
} from '../types/apis/houseInfo';
import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';

export const selectHouseInfo = async (
  requestData: SelectHouseInfoRequest
): Promise<SelectHouseInfoResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: '/api/v1/housing-selections',
    body: requestData,
  };

  return await request<SelectHouseInfoResponse['data']>(config);
};
