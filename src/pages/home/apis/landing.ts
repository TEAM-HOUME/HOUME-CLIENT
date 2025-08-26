import { API_URL } from '@constants/apiEndpoints';
import { HTTPMethod, request } from '@/shared/apis/request';

export const getHistoryData = async () => {
  return request({
    method: HTTPMethod.GET,
    url: API_URL.ANALYTICS.CHECK_GENERATED_IMAGE,
  });
};
