import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
  mapCompareJobToView,
  mapComparePresetToView,
  type CompareResultViewModel,
  type CompareSearchedProductView,
  toSearchedProductView,
} from '@pages/home/components/compare/utils/mapCompareResultToView';
import {
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRESET_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
} from '@pages/home/constants/compareParams';
import type { CompareView } from '@pages/home/constants/compareView';
import { useComparePreset } from '@pages/home/hooks/useComparePreset';
import { usePriceCompareJob } from '@pages/home/hooks/usePriceCompareJob';

export {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';

interface CompareTabState {
  view: CompareView;
  productUrl: string | null;
  errorMessage: string | null;
  /** RESULT 뷰가 그릴 값. job이든 프리셋이든 같은 형태로 맞춰 CompareResult는 출처를 모른다 */
  resultViewModel: CompareResultViewModel | null;
  /** 로딩 중에 먼저 그릴 "검색한 상품" 카드. job은 생성 응답 즉시, 프리셋은 응답이 오면 채워진다 */
  searchedProduct: CompareSearchedProductView | null;
  start: (url: string) => void;
  selectPreset: (presetId: number) => void;
  reset: () => void;
}

/**
 * 비교 탭 화면 상태.
 * job 수명(usePriceCompareJob)과 프리셋 조회(useComparePreset)를 합쳐
 * CompareTab이 view 하나만 보고 그리게 한다.
 *
 * useSearchParams()는 여기서 한 번만 호출해 두 훅에 내려준다. 각 훅이 따로 호출하면
 * 같은 틱에서 여러 URL 쓰기가 겹칠 때(예: reset) 서로 다른 stale snapshot을 기준으로
 * setSearchParams를 호출해 나중 호출이 앞선 변경을 덮어쓰는 문제가 생긴다.
 */
export const useCompareTab = (): CompareTabState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    view: jobView,
    productUrl,
    errorMessage: jobErrorMessage,
    result: jobResult,
    originalProduct: jobOriginalProduct,
    start,
    dismissCreateError,
  } = usePriceCompareJob(searchParams, setSearchParams);

  const {
    isActive: isPresetActive,
    view: presetView,
    presetResult,
    errorMessage: presetErrorMessage,
    selectPreset: writePresetId,
  } = useComparePreset(searchParams, setSearchParams);

  const selectPreset = useCallback(
    (presetId: number) => {
      // 직전에 실패한 job 생성 에러가 남아 있으면 프리셋 화면과 겹친다
      dismissCreateError();
      writePresetId(presetId);
    },
    [dismissCreateError, writePresetId]
  );

  const reset = useCallback(() => {
    // job 생성 실패 mutation 상태는 URL과 무관하니 따로 지운다
    dismissCreateError();
    // jobId·presetId·productUrl을 한 번의 setSearchParams 호출로 같이 지운다.
    // 두 번 나눠 부르면 두 번째 호출이 첫 번째가 지운 파라미터를 되살릴 수 있다
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(COMPARE_JOB_ID_PARAM);
        next.delete(COMPARE_PRESET_ID_PARAM);
        next.delete(COMPARE_PRODUCT_URL_PARAM);
        return next;
      },
      { replace: false }
    );
  }, [dismissCreateError, setSearchParams]);

  // 프리셋은 job이 아니다. URL에 presetId가 있으면 job view보다 우선한다
  const view = presetView ?? jobView;

  const resultViewModel = useMemo(() => {
    if (isPresetActive) {
      return presetResult ? mapComparePresetToView(presetResult) : null;
    }
    return jobResult
      ? mapCompareJobToView(jobOriginalProduct ?? undefined, jobResult)
      : null;
  }, [isPresetActive, presetResult, jobResult, jobOriginalProduct]);

  const searchedProduct = useMemo(() => {
    if (resultViewModel) return resultViewModel.searchedProduct;
    if (isPresetActive) return null;
    return jobOriginalProduct
      ? toSearchedProductView(jobOriginalProduct)
      : null;
  }, [resultViewModel, isPresetActive, jobOriginalProduct]);

  return {
    view,
    productUrl,
    errorMessage: isPresetActive ? presetErrorMessage : jobErrorMessage,
    resultViewModel,
    searchedProduct,
    start,
    selectPreset,
    reset,
  };
};
