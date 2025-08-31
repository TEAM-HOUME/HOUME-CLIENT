/* 회원가입 API 함수 */
import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { SignupRequest, SignupResponse } from '../types/apis/signup';
import { HTTPMethod, request } from '@/shared/apis/request';

export const patchSignup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  return request({
    method: HTTPMethod.PATCH,
    url: API_ENDPOINT.USER.SIGN_UP,
    body: data as unknown as Record<string, unknown>,
  });
};
