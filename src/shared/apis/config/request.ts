import { isAxiosError } from 'axios';

import type { BaseResponse } from '@shared/types/apis';

import { RESPONSE_MESSAGE } from '@constants/response';

import axiosInstance from './axiosInstance';

import type { AxiosResponse } from 'axios';

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export type HTTPMethodType = (typeof HTTPMethod)[keyof typeof HTTPMethod];
type QueryValue = string | number | boolean | Array<string | number | boolean>;

export interface RequestConfig {
  method: HTTPMethodType;
  url: string;
  query?: Record<string, QueryValue>;
  body?: object;
  rawResponse?: boolean;
}

// 오버로드: rawResponse: true → AxiosResponse 전체 반환
export async function request<T>(
  config: RequestConfig & { rawResponse: true }
): Promise<AxiosResponse<BaseResponse<T>>>;
// 오버로드: 기본 → data만 반환
export async function request<T>(config: RequestConfig): Promise<T>;
// 구현
export async function request<T>(
  config: RequestConfig
): Promise<T | AxiosResponse<BaseResponse<T>>> {
  const { method, url, query, body, rawResponse } = config;
  let params: URLSearchParams | undefined;
  if (query) {
    params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params!.append(key, String(item)));
      } else {
        params!.append(key, String(value));
      }
    });
  }

  try {
    const response = await axiosInstance.request<BaseResponse<T>>({
      method,
      url,
      params,
      data: body,
    });

    if (rawResponse) return response;

    return response.data.data;
  } catch (error: unknown) {
    if (!isAxiosError<BaseResponse<unknown>>(error)) {
      if (import.meta.env.DEV) {
        console.error(`[실패] ${url} : 예상치 못한 오류`);
      }
      throw error;
    }

    const status = error.response?.status;
    const message =
      error.response?.data?.message ??
      (status ? RESPONSE_MESSAGE[status] : undefined) ??
      '알 수 없는 오류가 발생했습니다.';

    if (import.meta.env.DEV) {
      console.error(`[실패] ${url} : ${message}`);
    }

    throw error;
  }
}
