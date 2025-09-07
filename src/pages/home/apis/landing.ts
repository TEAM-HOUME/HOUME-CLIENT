import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export const getHistoryData = async () => {
  return request({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.ANALYTICS.CHECK_GENERATED_IMAGE,
  });
};
