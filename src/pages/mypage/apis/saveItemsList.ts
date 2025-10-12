// 마이페이지 찜한 가구 조회
import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type { JjymsResponse } from '../types/apis/saveItemsList';

export const getJjymList = async () => {
  return request<JjymsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.MYPAGE_JJYM_LIST,
  });
};
