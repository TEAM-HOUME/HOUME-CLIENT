import type { CompareLoadingStage } from '@pages/home/components/compare/LoadingCard/compareLoadingMessages';

interface ResolveCompareLoadingStageParams {
  status: string | undefined;
  currentStage: string | null | undefined;
}

export const resolveCompareLoadingStage = (
  params: ResolveCompareLoadingStageParams
): CompareLoadingStage => {
  if (params.status !== 'RUNNING') return 'SCRAPING';

  switch (params.currentStage) {
    case 'SEARCHING':
    case 'MERGING':
    case 'SORTING':
      return params.currentStage;
    case null:
    case undefined:
      return 'SCRAPING';
    default:
      return 'SCRAPING';
  }
};

interface ResolveJobErrorMessageParams {
  hasError: boolean;
  isJobMissing: boolean;
  failedMessage: string | null | undefined;
  requestMessage: string | null;
}

export const resolveJobErrorMessage = ({
  hasError,
  isJobMissing,
  failedMessage,
  requestMessage,
}: ResolveJobErrorMessageParams): string | null => {
  if (!hasError) return null;
  if (failedMessage) return failedMessage;
  if (requestMessage) return requestMessage;
  // TODO: 기획에서 에러 케이스별 문구를 전달받으면 fallback 문구를 교체한다.
  return isJobMissing ? '검색 결과가 만료되었어요' : '비교에 실패했어요';
};

export interface CompareSaveTarget {
  productId: string;
  source: 'EBAY' | 'COUPANG' | 'RAW';
}

export const resolveCompareSaveTarget = (
  productId: string | null | undefined,
  source: string | null | undefined
): CompareSaveTarget | null => {
  if (!productId) return null;
  if (source !== 'EBAY' && source !== 'COUPANG' && source !== 'RAW') {
    return null;
  }
  return { productId, source };
};

export const calculateCompareBenefitAmount = (
  originalPrice: number | null | undefined,
  similarPrice: number | null | undefined
): number =>
  originalPrice != null && similarPrice != null
    ? Math.max(0, originalPrice - similarPrice)
    : 0;
