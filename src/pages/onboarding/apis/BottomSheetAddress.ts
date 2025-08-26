import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { BottomSheetAddressRequest } from '../types/apis/bottomSheetAddress.types';
import { HTTPMethod, request } from '@/shared/apis/request';

export const postAddress = async (body: BottomSheetAddressRequest) => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.ONBOARDING.ADDRESSES,
    body,
  });
};
