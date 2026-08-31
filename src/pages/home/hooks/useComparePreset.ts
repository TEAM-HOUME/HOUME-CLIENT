import { useCallback } from 'react';

import { useComparePresetQuery } from '@pages/home/apis/queries/useComparePresetQuery';
import {
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRESET_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
} from '@pages/home/constants/compareParams';
import {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';
import type { ComparePresetResponse } from '@pages/home/types/compare';
import {
  getServerErrorCode,
  getServerErrorMessage,
  isComparePresetNotFound,
} from '@pages/home/utils/compareJobError';

import type { SetURLSearchParams } from 'react-router-dom';

interface ComparePresetFlow {
  /** URL에 presetId가 있으면 true. 탭 view 합성 시 job보다 우선한다 */
  isActive: boolean;
  view: CompareView | null;
  presetResult: ComparePresetResponse | null;
  errorCode: number | null;
  /** 실패했을 때 화면에 보여줄 완결된 문구. 실패가 아니면 null.
   * 서버 문구가 있으면 그걸, 없으면 이 훅이 preset 사유(존재하지 않음 등)에 맞는 기본 문구로 채운다 */
  errorMessage: string | null;
  /** 프리셋 클릭 시 주소에 presetId를 넣어 고정 결과를 조회한다 */
  selectPreset: (presetId: number) => void;
}

/**
 * 프리셋 고정 결과 조회 흐름.
 * 라이브 job이 아니라 DB 스냅샷 GET — usePriceCompareJob과 수명이 다르다.
 *
 * searchParams/setSearchParams는 useCompareTab이 useSearchParams()를 한 번만 호출해 내려준다.
 * 이유는 usePriceCompareJob 쪽 주석 참고.
 */
export const useComparePreset = (
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams
): ComparePresetFlow => {
  const presetId = parsePresetId(searchParams.get(COMPARE_PRESET_ID_PARAM));

  const { data, error } = useComparePresetQuery(presetId);

  const selectPreset = useCallback(
    (nextPresetId: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(COMPARE_PRESET_ID_PARAM, String(nextPresetId));
          next.delete(COMPARE_JOB_ID_PARAM);
          next.delete(COMPARE_PRODUCT_URL_PARAM);
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const isActive = presetId !== null;
  const hasError = Boolean(error);

  const view = resolvePresetView({
    isActive,
    hasError,
    // similarProducts는 전체가 아니라 일부만 올 수 있어(명세 예시: 2건+totalCount 17)
    // 0건 판정은 배열 길이가 아니라 totalCount로 한다
    totalCount: data?.totalCount,
  });

  return {
    isActive,
    view,
    // presetId가 없을 때도 RQ는 마지막 data를 돌려준다. job RESULT에 새지 않게 비활성이면 null
    presetResult: isActive ? (data ?? null) : null,
    errorCode: getServerErrorCode(error),
    errorMessage: resolvePresetErrorMessage({
      hasError,
      isPresetMissing: isComparePresetNotFound(error),
      serverMessage: getServerErrorMessage(error),
    }),
    selectPreset,
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
}: {
  isActive: boolean;
  hasError: boolean;
  totalCount: number | undefined;
}): CompareView | null => {
  if (!isActive) return null;
  if (hasError) return COMPARE_VIEW.ERROR;
  if (totalCount === undefined) return COMPARE_VIEW.LOADING;
  return totalCount === 0 ? COMPARE_VIEW.EMPTY : COMPARE_VIEW.RESULT;
};

interface ResolvePresetErrorMessageParams {
  hasError: boolean;
  isPresetMissing: boolean;
  serverMessage: string | null;
}

/**
 * preset 실패 문구도 이 함수 하나에서 완결한다 — CompareTab은 왜 실패했는지 몰라도 된다.
 * job 쪽 동일 문구는 usePriceCompareJob의 resolveJobErrorMessage가 따로 담당한다.
 */
const resolvePresetErrorMessage = ({
  hasError,
  isPresetMissing,
  serverMessage,
}: ResolvePresetErrorMessageParams): string | null => {
  if (!hasError) return null;
  if (serverMessage) return serverMessage;
  return isPresetMissing ? '존재하지 않는 프리셋이에요' : '비교에 실패했어요';
};
