import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type { SaveItemsRequest, SaveItemsResponse } from '../types/saveItems';

// 가구 찜하기 API
export const postJjym = async (
  jjymData: SaveItemsRequest
): Promise<SaveItemsResponse> => {
  return request<SaveItemsResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.JJYM(jjymData.recommendFurnitureId),
  });
};
