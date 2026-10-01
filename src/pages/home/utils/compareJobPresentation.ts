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

export const calculateCompareBenefitAmount = (
  originalPrice: number | null | undefined,
  similarPrice: number | null | undefined
): number =>
  originalPrice != null && similarPrice != null
    ? Math.max(0, originalPrice - similarPrice)
    : 0;
