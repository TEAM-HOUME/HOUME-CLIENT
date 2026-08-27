import { useMutation } from '@tanstack/react-query';

import type {
  CreateCompareJobRequest,
  CreateCompareJobResponse,
} from '@pages/home/types/compare';
import { toCompareRequestUrl } from '@pages/home/utils/compareRequestUrl';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

/**
 * 비교 job 생성 — 원본 상품 URL을 넘기고 jobId를 받는다(202).
 * 서버는 파이프라인 완료를 기다리지 않고 즉시 응답하며, 진행 상태는 폴링으로 본다.
 *
 * 프로토콜 생략·딥링크 형태·광고 추적 파라미터는 서버가 처리하므로 손대지 않는다.
 * 인코딩만 맞춰서 보낸다.
 */
export const postCompareJob = async (
  body: CreateCompareJobRequest
): Promise<CreateCompareJobResponse> => {
  return request<CreateCompareJobResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.COMPARE.CREATE_JOB,
    body: { url: toCompareRequestUrl(body.url) },
  });
};

export const useCreateCompareJobMutation = () => {
  return useMutation({ mutationFn: postCompareJob });
};
