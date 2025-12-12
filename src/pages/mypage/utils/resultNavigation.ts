import { primeDetectionCacheEntry } from '@pages/generate/hooks/useDetectionCache';
import { useDetectionCacheStore } from '@pages/generate/stores/useDetectionCacheStore';

import type {
  MyPageImageDetail,
  MyPageImageDetailData,
  MyPageImageHistory,
  MyPageUserData,
} from '../types/apis/MyPage';
import type { DetectionCacheEntry } from '@pages/generate/stores/useDetectionCacheStore';

interface BuildResultNavigationArgs {
  history: MyPageImageHistory;
  userProfile?: MyPageUserData | null;
}

export interface ResultNavigationState {
  userProfile?: MyPageUserData | null;
  initialHistory?: MyPageImageHistory | null;
  cachedDetection?: DetectionCacheEntry | null;
}

const toDetailSkeleton = (history: MyPageImageHistory): MyPageImageDetail => ({
  equilibrium: history.equilibrium,
  houseForm: history.houseForm,
  tasteTag: history.tasteTag,
  name: history.tasteTag,
  generatedImageUrl: history.generatedImageUrl,
  isLike: false,
  imageId: history.imageId,
});

export const buildResultNavigationState = ({
  history,
  userProfile,
}: BuildResultNavigationArgs): ResultNavigationState => {
  const detectionEntry =
    useDetectionCacheStore.getState().images[history.imageId] ?? null;
  if (detectionEntry) {
    primeDetectionCacheEntry(history.imageId, detectionEntry);
  }

  return {
    userProfile,
    initialHistory: history,
    cachedDetection: detectionEntry,
  };
};

export const createImageDetailPlaceholder = (
  history: MyPageImageHistory
): MyPageImageDetailData => ({
  histories: [toDetailSkeleton(history)],
});
