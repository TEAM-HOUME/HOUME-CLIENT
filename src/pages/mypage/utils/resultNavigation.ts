import { queryClient } from '@/shared/apis/queryClient';
import { QUERY_KEY } from '@/shared/constants/queryKey';

import { primeDetectionCacheEntry } from '@pages/generate/hooks/useDetectionCache';
import { useDetectionCacheStore } from '@pages/generate/stores/useDetectionCacheStore';

import type {
  MyPageImageDetail,
  MyPageImageDetailResponse,
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

const seedImageDetailQuery = (history: MyPageImageHistory) => {
  const existing = queryClient.getQueryData<
    MyPageImageDetailResponse | undefined
  >([QUERY_KEY.MYPAGE_IMAGE_DETAIL, history.houseId]);

  if (existing) return;

  const skeleton: MyPageImageDetailResponse = {
    code: 200,
    message: '',
    data: {
      histories: [toDetailSkeleton(history)],
    },
  };

  queryClient.setQueryData(
    [QUERY_KEY.MYPAGE_IMAGE_DETAIL, history.houseId],
    skeleton
  );
};

export const buildResultNavigationState = ({
  history,
  userProfile,
}: BuildResultNavigationArgs): ResultNavigationState => {
  const detectionEntry =
    useDetectionCacheStore.getState().images[history.imageId] ?? null;
  if (detectionEntry) {
    primeDetectionCacheEntry(history.imageId, detectionEntry);
  }

  seedImageDetailQuery(history);

  return {
    userProfile,
    initialHistory: history,
    cachedDetection: detectionEntry,
  };
};
