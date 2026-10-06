import { useCallback, useEffect, useState } from 'react';

import { useQueryClient, type QueryClient } from '@tanstack/react-query';

import { useComparePresetQuery } from '@pages/home/apis/queries/useComparePresetQuery';
import {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';
import {
  getServerErrorCode,
  isComparePresetNotFound,
} from '@pages/home/utils/compareJobError';

import { useCompareJobStore } from '@store/useCompareJobStore';

import type { PresetDetailResponse } from '@apis/__generated__/data-contracts';

import { COMPARE_PRESET_ID_PARAM } from '@constants/compareParams';
import { queryKeys } from '@constants/queryKey';

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
  /** 일시적 오류는 같은 프리셋을 재조회하고, 없는 프리셋은 검색 화면으로 돌아간다 */
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

  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useComparePresetQuery(presetId);

  // 이미 받아 둔 프리셋은 최소 로딩을 건너뛴다. 재진입할 때마다 스켈레톤을 다시 보여줄 이유가 없다.
  // 첫 렌더부터 건너뛰도록 초기값에서도 본다 (효과에서만 풀면 한 프레임 스켈레톤이 보인다)
  const [isMinLoadingDone, setIsMinLoadingDone] = useState(
    () => presetId !== null && hasCachedPreset(queryClient, presetId)
  );

  useEffect(() => {
    if (presetId === null) {
      setIsMinLoadingDone(false);
      return;
    }

    if (hasCachedPreset(queryClient, presetId)) {
      setIsMinLoadingDone(true);
      return;
    }

    setIsMinLoadingDone(false);
    const timer = window.setTimeout(() => {
      setIsMinLoadingDone(true);
    }, COMPARE_PRESET_MIN_LOADING_MS);

    return () => window.clearTimeout(timer);
  }, [presetId, queryClient]);

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
    if (isComparePresetNotFound(error)) {
      setSearchParams((prev) => applyCompareTabParams(prev, null), {
        replace: false,
      });
      return;
    }

    void refetch();
  }, [error, refetch, setSearchParams]);

  const isActive = presetId !== null;
  const hasError = Boolean(error);
  const isShowingLoadingSkeleton = isActive && (isLoading || !isMinLoadingDone);

  // 로딩 화면이 보이는 동안 이미지 생성을 막는다 (useCompareJobGuard). 로딩이 끝나거나 화면을 떠나면 푼다
  const setActivePresetId = useCompareJobStore(
    (state) => state.setActivePresetId
  );
  const clearActivePreset = useCompareJobStore(
    (state) => state.clearActivePreset
  );
  useEffect(() => {
    if (presetId === null || !isShowingLoadingSkeleton) return;
    setActivePresetId(presetId);
    return clearActivePreset;
  }, [
    presetId,
    isShowingLoadingSkeleton,
    setActivePresetId,
    clearActivePreset,
  ]);

  const view = resolvePresetView({
    isActive,
    hasError,
    // similarProducts는 전체가 아니라 일부만 올 수 있어(명세 예시: 2건+totalCount 17)
    // 0건 판정은 배열 길이가 아니라 totalCount로 한다
    totalCount: data?.totalCount,
    isShowingLoadingSkeleton,
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

const hasCachedPreset = (queryClient: QueryClient, presetId: number) =>
  queryClient.getQueryData(queryKeys.compare.presetResult(presetId)) !==
  undefined;

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
