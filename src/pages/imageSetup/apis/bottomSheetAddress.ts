import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { UserAddressRequest } from '../types/apis/bottomSheetAddress.types';
import { HTTPMethod, request } from '@/shared/apis/request';

// API Functions
export const postAddress = async (body: UserAddressRequest) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.ADDRESS_SEARCH,
    body,
  });
};
