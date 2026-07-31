import { useEffect, useMemo } from 'react';

import { useGenerateBannerImageMutation } from '@pages/generate/apis/mutations/useGenerateBannerImageMutation';
import { useGenerateFullFunnelImageMutation } from '@pages/generate/apis/mutations/useGenerateFullFunnelImageMutation';
import { useGenerateOtherStyleImageMutation } from '@pages/generate/apis/mutations/useGenerateOtherStyleImageMutation';
import { useGenerateProductImageMutation } from '@pages/generate/apis/mutations/useGenerateProductImageMutation';

import { buildGenerateRequest } from '@store/imageFlow/buildGenerateRequest';
import type { GenerateInvalidReason } from '@store/imageFlow/buildGenerateRequest';
import type { ImageFlow } from '@store/imageFlow/flowConfig';
import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';

import { reportMessage } from '@shared/monitoring/report';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';

import type {
  BannerGenerateImageRequest,
  GenerateImageV4Request,
  OtherStyleGenerateImageRequest,
  ProductGenerateImageRequest,
} from '@apis/__generated__/data-contracts';

// ReturnType<typeof XxxMutation>['mutate']: 각 mutation 훅이 반환하는 mutate 함수 타입 추출
// useGenerateImageRequest가 진입 경로별 payload를 조립하고 적절한 mutate 함수를 골라 LoadingPage에 전달
type FullFunnelMutate = ReturnType<
  typeof useGenerateFullFunnelImageMutation
>['mutate'];
type BannerMutate = ReturnType<typeof useGenerateBannerImageMutation>['mutate'];
type OtherStyleMutate = ReturnType<
  typeof useGenerateOtherStyleImageMutation
>['mutate'];
type ProductMutate = ReturnType<
  typeof useGenerateProductImageMutation
>['mutate'];

// LoadingPage에서 분기 없이 mutate(payload) 한 줄로 이미지 생성 API 호출 가능
export type GenerateImageRequestResult =
  | {
      kind: 'fullFunnel';
      mutate: FullFunnelMutate;
      payload: GenerateImageV4Request;
    }
  | {
      kind: 'banner';
      mutate: BannerMutate;
      payload: BannerGenerateImageRequest;
    }
  | {
      kind: 'otherStyle';
      mutate: OtherStyleMutate;
      payload: OtherStyleGenerateImageRequest;
    }
  | {
      kind: 'product';
      mutate: ProductMutate;
      payload: ProductGenerateImageRequest;
    }
  // reason·route는 LoadingPage가 Sentry로 보낼 때 원인을 구분하는 데 쓴다
  | {
      kind: 'invalid';
      reason: GenerateInvalidReason;
      route: ImageFlow['route'] | null;
    };

/**
 * 진입경로별 payload를 조립하고 알맞은 mutate를 골라 돌려준다
 *
 * `invalid`는 여기서 Sentry로 남긴다 — 원인(reason)을 아는 유일한 지점이기 때문.
 * 사용자는 퍼널을 다 밟고 CTA를 눌렀는데 에러 화면도 없이 홈으로 튕기고,
 * 서버 입장에서는 요청이 온 적이 없어 서버 로그에도 흔적이 없다.
 */
export const useGenerateImageRequest = (): GenerateImageRequestResult => {
  // 이미지 생성 API의 mutate 메서드 가져오기
  const { mutate: mutateFullFunnel } = useGenerateFullFunnelImageMutation();
  const { mutate: mutateBanner } = useGenerateBannerImageMutation();
  const { mutate: mutateOtherStyle } = useGenerateOtherStyleImageMutation();
  const { mutate: mutateProduct } = useGenerateProductImageMutation();

  // useMemo로 감싸 마운트 시 1회만 경로 분기 평가 → requestState 객체 ref 고정
  // (store는 getState() 스냅샷만 읽고, mutate 4개는 React Query가 컴포넌트 동안 같은 주소 유지 → deps 불변)
  const result = useMemo<GenerateImageRequestResult>(() => {
    // 검증·조립은 순수 함수 buildGenerateRequest가 담당, 훅은 kind에 맞는 mutate만 바인딩
    const plan = buildGenerateRequest(
      useImageFlowStore.getState().flow,
      useFunnelStore.getState()
    );

    switch (plan.kind) {
      case 'fullFunnel':
        return {
          kind: 'fullFunnel',
          mutate: mutateFullFunnel,
          payload: plan.payload,
        };
      case 'banner':
        return { kind: 'banner', mutate: mutateBanner, payload: plan.payload };
      case 'otherStyle':
        return {
          kind: 'otherStyle',
          mutate: mutateOtherStyle,
          payload: plan.payload,
        };
      case 'product':
        return {
          kind: 'product',
          mutate: mutateProduct,
          payload: plan.payload,
        };
      case 'invalid':
        return {
          kind: 'invalid',
          reason: plan.reason,
          route: plan.route,
        };
    }
  }, [mutateFullFunnel, mutateBanner, mutateOtherStyle, mutateProduct]);

  // fingerprint에 reason을 넣어 9가지 원인이 한 이슈로 뭉치지 않게 한다
  useEffect(() => {
    if (result.kind !== 'invalid') return;

    reportMessage('image generate request invalid', {
      scope: MONITORING_SCOPE.IMAGE_GENERATE,
      level: 'error',
      fingerprint: ['generate-invalid', result.reason],
      context: { reason: result.reason, route: result.route },
    });
  }, [result]);

  return result;
};
