import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import CardCuration from '@/pages/mypage/components/card/cardCuration/CardCuration';
import { useDetectionPrefetch } from '@/pages/mypage/hooks/useDetectionPrefetch';
import { useMyPageImagesQuery } from '@/pages/mypage/hooks/useMypage';
import type {
  MyPageImageHistory,
  MyPageUserData,
} from '@/pages/mypage/types/apis/MyPage';
import { logMyPageClickBtnImgCard } from '@/pages/mypage/utils/analytics';
import { buildResultNavigationState } from '@/pages/mypage/utils/resultNavigation';
import { ROUTES } from '@/routes/paths.ts';
import Loading from '@/shared/components/loading/Loading';

import * as styles from './GeneratedImagesSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

interface GeneratedImagesSectionProps {
  userProfile?: MyPageUserData | null;
}

const GeneratedImagesSection = ({
  userProfile,
}: GeneratedImagesSectionProps) => {
  const navigate = useNavigate();
  const { data: imagesData, isLoading, isError } = useMyPageImagesQuery();
  const { prefetchDetection } = useDetectionPrefetch();
  const prefetchedImageIdsRef = useRef<Set<number>>(new Set<number>());
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>(
    () => {
      if (typeof window === 'undefined') return {};
      try {
        const stored = sessionStorage.getItem('mypage-image-loaded');
        return stored ? (JSON.parse(stored) as Record<number, boolean>) : {};
      } catch {
        return {};
      }
    }
  );
  const primaryImageId = imagesData?.histories[0]?.imageId ?? null;

  useEffect(() => {
    if (!imagesData?.histories) return;
    imagesData.histories.forEach((history, index) => {
      if (prefetchedImageIdsRef.current.has(history.imageId)) return;
      prefetchedImageIdsRef.current.add(history.imageId);
      prefetchDetection(history.imageId, history.generatedImageUrl, {
        priority: index === 0 ? 'immediate' : 'background',
      });
    });
  }, [imagesData, prefetchDetection]);

  const scheduleDetectionPrefetch = useCallback(
    (imageId: number, imageUrl: string, options?: { immediate?: boolean }) => {
      if (!imageId || !imageUrl) return;
      const runTask = () => {
        prefetchDetection(imageId, imageUrl, {
          priority: options?.immediate ? 'immediate' : 'background',
        });
      };
      if (options?.immediate || typeof window === 'undefined') {
        runTask();
        return;
      }
      const idleCallback = (
        window as Window & {
          requestIdleCallback?: (callback: IdleRequestCallback) => number;
        }
      ).requestIdleCallback;
      if (idleCallback) {
        idleCallback(() => runTask());
        return;
      }
      window.setTimeout(runTask, 0);
    },
    [prefetchDetection]
  );

  const handleViewResult = (history: MyPageImageHistory) => {
    const { houseId } = history;
    logMyPageClickBtnImgCard();
    const navigationState = buildResultNavigationState({
      history,
      userProfile: userProfile ?? null,
    });
    const params = new URLSearchParams({
      from: 'mypage',
      houseId: String(houseId),
    });
    navigate(`${ROUTES.GENERATE_RESULT}?${params.toString()}`, {
      state: navigationState,
    });
    // 네비게이션 직후 우선순위 감지 프리페치 실행
    scheduleDetectionPrefetch(history.imageId, history.generatedImageUrl, {
      immediate: true,
    });
  };

  const handleImageLoad = useCallback(
    (imageId: number, imageUrl?: string) => {
      setLoadedImages((prev) => {
        if (prev[imageId]) return prev;
        const next = { ...prev, [imageId]: true };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mypage-image-loaded', JSON.stringify(next));
        }
        return next;
      });
      if (imageUrl) {
        scheduleDetectionPrefetch(imageId, imageUrl, {
          immediate: primaryImageId === imageId,
        });
      }
    },
    [primaryImageId, scheduleDetectionPrefetch]
  );

  // 로딩 중
  if (isLoading) {
    return <Loading />;
  }

  // 에러 또는 데이터 없음
  if (isError || !imagesData) {
    return <EmptyStateSection type="generatedImages" />;
  }

  // 이미지가 없을 때
  if (imagesData.histories.length === 0) {
    return <EmptyStateSection type="generatedImages" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {imagesData.histories.map((image) => (
          <CardCuration
            key={image.imageId}
            imageId={image.imageId}
            imageUrl={image.generatedImageUrl}
            isLoaded={loadedImages[image.imageId]}
            onImageLoad={handleImageLoad}
            onCurationClick={() => handleViewResult(image)}
          />
        ))}
      </div>
    </section>
  );
};

export default GeneratedImagesSection;
