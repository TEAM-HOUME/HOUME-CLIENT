import { useCallback, useEffect, useState } from 'react';

import { useComparePresetQuery } from '@pages/home/apis/queries/useComparePresetQuery';
import {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';
import { getServerErrorCode } from '@pages/home/utils/compareJobError';

import type { PresetDetailResponse } from '@apis/__generated__/data-contracts';

import { COMPARE_PRESET_ID_PARAM } from '@constants/compareParams';

import { applyCompareTabParams } from '@utils/compareTabPath';

import type { SetURLSearchParams } from 'react-router-dom';

const COMPARE_PRESET_MIN_LOADING_MS = 3_000;

interface ComparePresetFlow {
  /** URL에 presetId가 있으면 true. 탭 view 합성 시 job보다 우선한다 */
  isActive: boolean;
  view: CompareView | null;
  presetResult: PresetDetailResponse | null;
  errorCode: number | null;
  /** 프리셋 클릭 시 주소에 presetId를 넣어 고정 결과를 조회한다 */
  selectPreset: (presetId: number) => void;
  /** 오류가 발생한 같은 프리셋을 다시 조회한다 */
  retry: () => void;
}

/**
 * 프리셋 고정 결과 조회 흐름.
 * 라이브 job이 아니라 DB 스냅샷 GET — usePriceCompareJob과 수명이 다르다.
 * API는 빨리 오지만 job과 같은 CompareResultSkeleton을 최소 COMPARE_PRESET_MIN_LOADING_MS 동안 보여준다.
 *
 * searchParams/setSearchParams는 useCompareTab이 useSearchParams()를 한 번만 호출해 내려준다.
 * 이유는 usePriceCompareJob 쪽 주석 참고.
 */
export const useComparePreset = (
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams
): ComparePresetFlow => {
  const presetId = parsePresetId(searchParams.get(COMPARE_PRESET_ID_PARAM));

  const { data, error, isLoading, refetch } = useComparePresetQuery(presetId);
  const [isMinLoadingDone, setIsMinLoadingDone] = useState(false);

  useEffect(() => {
    if (presetId === null) {
      setIsMinLoadingDone(false);
      return;
    }

    setIsMinLoadingDone(false);
    const timer = window.setTimeout(() => {
      setIsMinLoadingDone(true);
    }, COMPARE_PRESET_MIN_LOADING_MS);

    return () => window.clearTimeout(timer);
  }, [presetId]);

  const selectPreset = useCallback(
    (nextPresetId: number) => {
      // jobId·productUrl은 함께 지워진다 (applyCompareTabParams)
      setSearchParams(
        (prev) => applyCompareTabParams(prev, { presetId: nextPresetId }),
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const isActive = presetId !== null;
  const hasError = Boolean(error);

  const view = resolvePresetView({
    isActive,
    hasError,
    // similarProducts는 전체가 아니라 일부만 올 수 있어(명세 예시: 2건+totalCount 17)
    // 0건 판정은 배열 길이가 아니라 totalCount로 한다
    totalCount: data?.totalCount,
    isShowingLoadingSkeleton: isActive && (isLoading || !isMinLoadingDone),
  });

  return {
    isActive,
    view,
    // presetId가 없을 때도 RQ는 마지막 data를 돌려준다. job RESULT에 새지 않게 비활성이면 null
    presetResult: isActive ? (data ?? null) : null,
    errorCode: getServerErrorCode(error),
    selectPreset,
    retry,
  };
};

const parsePresetId = (value: string | null): number | null => {
  if (value === null || !/^\d+$/.test(value)) return null;
  const presetId = Number(value);
  // Number()는 MAX_SAFE_INTEGER를 넘는 정수를 반올림한다 — API/queryKey에 다른 id가 실리면 안 된다
  return Number.isSafeInteger(presetId) ? presetId : null;
};

const resolvePresetView = ({
  isActive,
  hasError,
  totalCount,
  isShowingLoadingSkeleton,
}: {
  isActive: boolean;
  hasError: boolean;
  totalCount: number | undefined;
  isShowingLoadingSkeleton: boolean;
}): CompareView | null => {
  if (!isActive) return null;
  if (isShowingLoadingSkeleton) return COMPARE_VIEW.LOADING;
  if (hasError) return COMPARE_VIEW.ERROR;
  if (totalCount === undefined) return COMPARE_VIEW.LOADING;
  return totalCount === 0 ? COMPARE_VIEW.EMPTY : COMPARE_VIEW.RESULT;
};
