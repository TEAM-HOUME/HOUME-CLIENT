import { useCallback, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useMypageGeneratedImagesAnalytics } from '@pages/mypage/analytics/useMypageAnalytics';
import { useGetGeneratedImageListQuery } from '@pages/mypage/apis/queries/useMyPageImagesQuery';
import { useDetectionPrefetch } from '@pages/mypage/hooks/useDetectionPrefetch';
import { formatDate } from '@pages/mypage/utils/formatting';

import { ROUTES } from '@routes/paths';

import { isCurationViewType } from '@store/imageFlow/flowConfig';

import type { ItemResponse } from '@apis/__generated__/data-contracts';

import Loading from '@components/loading/Loading';

import * as styles from './GeneratedImagesSection.css';
import GenImgCard from '../../card/genImgCard/GenImgCard';
import EmptyStateSection from '../emptyState/EmptyStateSection';

/**
 * 마이페이지 생성 이미지 목록 섹션
 * - 감지 데이터 프리패치와 네비게이션 상태 구성을 함께 처리
 */
const GeneratedImagesSection = () => {
  const navigate = useNavigate();

  const {
    data: imagesListData,
    isPending,
    isError,
  } = useGetGeneratedImageListQuery();

  const groups = imagesListData?.groups ?? [];
  const isListReady = !isPending && !isError && !!imagesListData;

  const { trackCardGenImgClick, trackMoreGenImgClick } =
    useMypageGeneratedImagesAnalytics({
      groups,
      isListReady,
    });

  const { prefetchDetection } = useDetectionPrefetch();
  const prefetchedImageIdsRef = useRef<Set<number>>(new Set<number>());

  const primaryImageId =
    imagesListData?.groups?.[0]?.items?.[0]?.imageId ?? null;

  useEffect(() => {
    if (!imagesListData?.groups) return;

    const allItems = imagesListData.groups.flatMap(
      (group) => group.items ?? []
    );

    allItems.forEach((item, index) => {
      if (item.imageId == null || !item.generatedImageUrl) return;
      if (prefetchedImageIdsRef.current.has(item.imageId)) return;
      prefetchedImageIdsRef.current.add(item.imageId);
      prefetchDetection(item.imageId, item.generatedImageUrl, {
        priority: index === 0 ? 'immediate' : 'background',
      });
    });
  }, [imagesListData, prefetchDetection]);

  const scheduleDetectionPrefetch = useCallback(
    (
      imageId: number,
      imageUrl: string,
      options?: { immediate?: boolean; persistAfterUnmount?: boolean }
    ) => {
      if (!imageId || !imageUrl) return;
      const runTask = () => {
        prefetchDetection(imageId, imageUrl, {
          priority: options?.immediate ? 'immediate' : 'background',
          persistAfterUnmount: options?.persistAfterUnmount ?? false,
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

  const handleViewResult = (item: ItemResponse) => {
    if (item.imageId == null || !item.generatedImageUrl || !item.viewType) {
      return;
    }
    navigate(
      `${ROUTES.GENERATE_RESULT}?houseId=${item.imageId}&viewType=${item.viewType}`,
      {
        state: {
          imageUrl: item.generatedImageUrl,
          isMirror: item.isMirror,
          from: 'mypage',
          entryGenImgId: item.imageId,
        },
      }
    );
    scheduleDetectionPrefetch(item.imageId, item.generatedImageUrl, {
      immediate: true,
      persistAfterUnmount: true,
    });
  };

  const handleImageLoad = useCallback(
    (imageId: number, imageUrl?: string) => {
      if (imageUrl) {
        scheduleDetectionPrefetch(imageId, imageUrl, {
          immediate: primaryImageId === imageId,
        });
      }
    },
    [primaryImageId, scheduleDetectionPrefetch]
  );

  if (isPending) {
    return <Loading />;
  }

  if (isError || !imagesListData) {
    return <EmptyStateSection type="generatedImages" />;
  }

  if (groups.length === 0) {
    return <EmptyStateSection type="generatedImages" />;
  }

  return (
    <section className={styles.wrapper}>
      {groups.map((group, index) => (
        <div key={group.date}>
          {index > 0 && <div className={styles.divider} />}
          <div className={styles.groupContainer}>
            <div className={styles.date}>
              {group.date ? formatDate(group.date) : ''}
            </div>
            <div className={styles.listContainer}>
              {(group.items ?? []).map((item) => {
                if (item.imageId == null) return null;
                const isCurationCard = isCurationViewType(item.viewType);
                return (
                  <GenImgCard
                    key={item.imageId}
                    cardType={isCurationCard ? 'curation' : 'list'}
                    productSummaryText={item.productSummaryText}
                    bannerTitle={item.bannerTitle}
                    viewType={item.viewType}
                    imageId={item.imageId}
                    imageUrl={item.generatedImageUrl}
                    isMirror={item.isMirror}
                    usedProducts={item.usedProducts}
                    onCardGenImgClick={() => {
                      trackCardGenImgClick(item);
                      handleViewResult(item);
                    }}
                    onBtnMoreGenImgClick={() => {
                      trackMoreGenImgClick(item);
                      handleViewResult(item);
                    }}
                    onImageLoad={() =>
                      handleImageLoad(item.imageId!, item.generatedImageUrl)
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default GeneratedImagesSection;
