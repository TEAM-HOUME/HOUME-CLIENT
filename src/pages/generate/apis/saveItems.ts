import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

// 가구 찜하기 API
export const postJjym = async (recommendFurnitureId: number) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.JJYM(recommendFurnitureId),
  });
};
