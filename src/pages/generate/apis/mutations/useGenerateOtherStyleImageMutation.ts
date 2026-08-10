import { useMutation } from '@tanstack/react-query';

import { useGenerateStore } from '@pages/generate/stores/useGenerateStore';
import type { GeneratedImagePayload } from '@pages/generate/types/generate';

import { MONITORING_SCOPE } from '@shared/monitoring/scope';

import type {
  OtherStyleGenerateImageRequest,
  OtherStyleGenerateImageResponse,
} from '@apis/__generated__/data-contracts';
import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

import { toGeneratedImagePayload } from './toGeneratedImagePayload';

export const postGenerateOtherStyleImage = async (
  requestData: OtherStyleGenerateImageRequest
): Promise<GeneratedImagePayload> => {
  const response = await request<OtherStyleGenerateImageResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.IMAGE_OTHER_STYLE,
    body: requestData,
  });

  return toGeneratedImagePayload(response);
};

export const useGenerateOtherStyleImageMutation = () => {
  const { setApiCompleted, setNavigationData, resetGenerate } =
    useGenerateStore();

  return useMutation<
    GeneratedImagePayload,
    Error,
    OtherStyleGenerateImageRequest
  >({
    mutationFn: postGenerateOtherStyleImage,
    // 실패 시 전역 에러 핸들러가 이 scope를 태그로 붙여 Sentry로 보낸다
    meta: { sentry: { scope: MONITORING_SCOPE.IMAGE_GENERATE } },
    onSuccess: (data) => {
      resetGenerate();
      setNavigationData(data);
      setApiCompleted(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.generate.image() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.images() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.user() });
      // 모든 생성 경로는 도면 선택이 필수 → 생성 성공 시 '최근 생성한 도면' 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.imageSetup.recentFloorPlan(),
      });
    },
  });
};
