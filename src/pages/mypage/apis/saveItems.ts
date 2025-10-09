// 마이페이지 찜한 가구 조회
import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export const getJjym = async () => {
  return request({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.MYPAGE_JJYM_LIST,
  });
};
