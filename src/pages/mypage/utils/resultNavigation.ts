import { primeDetectionCacheEntry } from '@shared/detection/hooks/useDetectionCache';
import { useDetectionCacheStore } from '@shared/detection/stores/useDetectionCacheStore';
import type { DetectionCacheEntry } from '@shared/detection/stores/useDetectionCacheStore';

import type {
  MyPageImageDetail,
  MyPageImageDetailData,
  MyPageImageHistory,
} from '../types/apis/generateList';
import type { MyPageUserData } from '../types/apis/userData';

interface BuildResultNavigationArgs {
  imageId: number;
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
  userProfile,
  imageId,
}: BuildResultNavigationArgs): ResultNavigationState => {
  const detectionEntry =
    useDetectionCacheStore.getState().images[imageId] ?? null;
  if (detectionEntry) {
    primeDetectionCacheEntry(imageId, detectionEntry);
  }

  return {
    userProfile,
    cachedDetection: detectionEntry,
  };
};

export const createImageDetailPlaceholder = (
  history: MyPageImageHistory
): MyPageImageDetailData => ({
  histories: [toDetailSkeleton(history)],
});
