/* 회원가입 API 함수 */
import { API_URL } from '@constants/apiEndpoints';
import axiosInstance from '@shared/apis/axiosInstance';
import type { SignupRequest, SignupResponse } from '../types/apis/signup';

export const patchSignup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  try {
    const response = await axiosInstance.patch<SignupResponse>(
      API_URL.USER.SIGN_UP,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[signup] 요청 실패:', error.response?.data);
    console.error('[signup] 상태 코드:', error.response?.status);
    throw error;
  }
};
