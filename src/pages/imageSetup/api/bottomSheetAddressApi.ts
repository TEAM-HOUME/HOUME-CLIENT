import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type { BottomSheetAddressRequest } from '../types/apis/bottomSheetAddress.types';

// API Functions
export const postAddress = async (body: BottomSheetAddressRequest) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.ADDRESS_SEARCH,
    body,
  });
};
