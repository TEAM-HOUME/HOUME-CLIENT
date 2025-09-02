import axios, { AxiosError } from 'axios';

import { ERROR_CODES } from '../constants/apiErrorCode';

import type { BaseResponse } from '../types/apis';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 인증 제외 API 경로 (Authorization 헤더 제거 대상)
const EXCLUDE_AUTH_URLS = ['/oauth/kakao/callback'];

// 요청 시 accessToken 자동 삽입
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  // accessToken을 제외해야 하는 요청인지 확인
  const isExcluded = EXCLUDE_AUTH_URLS.includes(config.url ?? '');

  if (!isExcluded && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    // console.log('[axiosInstance] 요청에 accessToken 추가됨');
  }

  return config;
});

// 응답 시 accessToken 만료 에러 감지 및 재발급 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BaseResponse<null>>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    console.error('[axiosInstance] 응답 에러 발생:', error.response?.data);

    // accessToken 만료 에러 처리
    if (
      error?.response?.data?.code === ERROR_CODES.ACCESS_TOKEN_EXPIRED &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/reissue`,
          null,
          {
            withCredentials: true,
            headers: {}, // Authorization 헤더 제거
          }
        );

        const newAccessToken = res.headers['access-token'];
        if (!newAccessToken) throw new Error('새 액세스 토큰이 없습니다.');

        localStorage.setItem('accessToken', newAccessToken);

        // Zustand 상태도 동기화
        const { useUserStore } = await import('../../store/useUserStore');
        useUserStore.getState().setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest); // 원래 요청 재시도
      } catch (refreshError) {
        console.error('[axiosInstance] 토큰 재발급 실패:', refreshError);

        // 상태 정리 (alert 제거하고 에러만 던지기)
        const { useUserStore } = await import('../../store/useUserStore');
        useUserStore.getState().clearUser();

        // 에러만 던지고 UI 처리는 상위 컴포넌트에서 담당
        return Promise.reject(new Error('SESSION_EXPIRED'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
