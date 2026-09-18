import { useMutation } from '@tanstack/react-query';

import { toCompareRequestUrl } from '@pages/home/utils/compareRequestUrl';

import { useCompareJobStore } from '@store/useCompareJobStore';

import type {
  CreateCompareJobRequest,
  CreateJobResponse,
} from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

/**
 * 비교 job 생성 — 원본 상품 URL을 넘기고 jobId를 받는다(202).
 * 서버는 생성 시점에 원본 페이지를 긁어 title·thumbnail을 응답에 같이 주고, 유사 상품 검색은 이어서 비동기로 돈다.
 * 원본 페이지를 못 긁으면 job이 만들어지지 않고 HTTP 에러(502, code 50204)로 거절된다 — 이 mutation의 error로 온다.
 *
 * 프로토콜 생략·딥링크 형태·광고 추적 파라미터는 서버가 처리하므로 손대지 않는다.
 * 인코딩만 맞춰서 보낸다.
 */
export const postCompareJob = async (
  body: CreateCompareJobRequest
): Promise<CreateJobResponse> => {
  return request<CreateJobResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.COMPARE.CREATE_JOB,
    body: { url: toCompareRequestUrl(body.url) },
  });
};

export const useCreateCompareJobMutation = () => {
  return useMutation({
    mutationFn: postCompareJob,
    // 진행 중 job 등록은 여기(훅 수준)에서 한다. mutate()에 넘기는 콜백은 응답 전에 컴포넌트가 언마운트되면
    // 실행되지 않아, 생성 직후 다른 탭으로 가면 등록이 빠진다. 훅 수준 콜백은 언마운트와 무관하게 실행된다.
    // 첫 폴링 응답 전에 다른 화면으로 가도 지켜볼 수 있게 생성 즉시 올린다. 진행 중이던 이전 job은 덮어쓴다
    onSuccess: (response) => {
      if (response.jobId) {
        useCompareJobStore.getState().setActiveJobId(response.jobId);
      }
    },
  });
};
