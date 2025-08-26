import { API_ENDPOINT } from '@constants/apiEndpoints';
import { HTTPMethod, request } from '@/shared/apis/request';

export const getHistoryData = async () => {
  return request({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.ANALYTICS.CHECK_GENERATED_IMAGE,
  });
};
