import type { BottomSheetAddressRequest } from '../types/apis/bottomSheetAddress.types';
import { HTTPMethod, request } from '@/shared/apis/request';

// API Functions
export const postAddress = async (body: BottomSheetAddressRequest) => {
  return request({
    method: HTTPMethod.POST,
    url: `/api/v1/addresses`,
    body,
  });
};
