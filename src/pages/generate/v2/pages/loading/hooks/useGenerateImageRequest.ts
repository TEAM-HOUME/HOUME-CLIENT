import { useMemo } from 'react';

import { useGenerateBannerImageMutation } from '@pages/generate/apis/mutations/useGenerateBannerImageMutation';
import { useGenerateFullFunnelImageMutation } from '@pages/generate/apis/mutations/useGenerateFullFunnelImageMutation';
import { useGenerateOtherStyleImageMutation } from '@pages/generate/apis/mutations/useGenerateOtherStyleImageMutation';
import { useGenerateProductImageMutation } from '@pages/generate/apis/mutations/useGenerateProductImageMutation';

import { buildGenerateRequest } from '@store/imageFlow/buildGenerateRequest';
import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';

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
  | { kind: 'invalid' };

export const useGenerateImageRequest = (): GenerateImageRequestResult => {
  // 이미지 생성 API의 mutate 메서드 가져오기
  const { mutate: mutateFullFunnel } = useGenerateFullFunnelImageMutation();
  const { mutate: mutateBanner } = useGenerateBannerImageMutation();
  const { mutate: mutateOtherStyle } = useGenerateOtherStyleImageMutation();
  const { mutate: mutateProduct } = useGenerateProductImageMutation();

  // useMemo로 감싸 마운트 시 1회만 경로 분기 평가 → requestState 객체 ref 고정
  // (store는 getState() 스냅샷만 읽고, mutate 4개는 React Query가 컴포넌트 동안 같은 주소 유지 → deps 불변)
  return useMemo(() => {
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
        return { kind: 'invalid' };
    }
  }, [mutateFullFunnel, mutateBanner, mutateOtherStyle, mutateProduct]);
};
