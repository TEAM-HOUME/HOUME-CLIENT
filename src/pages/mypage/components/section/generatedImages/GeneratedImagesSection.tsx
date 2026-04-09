// import { useCallback, useEffect, useRef, useState } from 'react';

// import { useNavigate } from 'react-router-dom';

// import {
//   useGetGeneratedImageListQuery,
//   // useMyPageImagesQuery,
// } from '@pages/mypage/apis/queries/useMyPageImagesQuery';
// import { useDetectionPrefetch } from '@pages/mypage/hooks/useDetectionPrefetch';
// import { logMyPageClickBtnImgCard } from '@pages/mypage/utils/analytics';
// import { buildResultNavigationState } from '@pages/mypage/utils/resultNavigation';

// import { ROUTES } from '@routes/paths';

// import Loading from '@components/loading/Loading';

import { mockGeneratedImageList } from '@/pages/mypage/mocks/generateListMock';

import * as styles from './GeneratedImagesSection.css';
import GenImgCard from '../../card/genImgCard/GenImgCard';
import EmptyStateSection from '../emptyState/EmptyStateSection';

// import type { MyPageImageHistory } from '@/pages/mypage/types/apis/generateList';
// import type { MyPageUserData } from '@/pages/mypage/types/apis/userData';

// interface GeneratedImagesSectionProps {
//   userProfile?: MyPageUserData | null;
// }

/**
 * 마이페이지 생성 이미지 목록 섹션
 * - 감지 데이터 프리패치와 네비게이션 상태 구성을 함께 처리
 */
// const GeneratedImagesSection = ({
//   userProfile,
// }: GeneratedImagesSectionProps) => {
const GeneratedImagesSection = () => {
  // const navigate = useNavigate();

  // const {
  //   data: imagesListData,
  //   isPending,
  //   isError,
  // } = useGetGeneratedImageListQuery();

  // const { data: imagesData, isPending, isError } = useMyPageImagesQuery();
  //const { prefetchDetection } = useDetectionPrefetch();
  // const prefetchedImageIdsRef = useRef<Set<number>>(new Set<number>());
  // const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>(
  //   () => {
  //     if (typeof window === 'undefined') return {};
  //     try {
  //       const stored = sessionStorage.getItem('mypage-image-loaded');
  //       return stored ? (JSON.parse(stored) as Record<number, boolean>) : {};
  //     } catch {
  //       return {};
  //     }
  //   }
  // );
  // const primaryImageId = imagesData?.histories[0]?.imageId ?? null;

  // useEffect(() => {
  //   if (!imagesData?.histories) return;
  //   imagesData.histories.forEach((history, index) => {
  //     if (prefetchedImageIdsRef.current.has(history.imageId)) return;
  //     prefetchedImageIdsRef.current.add(history.imageId);
  //     prefetchDetection(history.imageId, history.generatedImageUrl, {
  //       priority: index === 0 ? 'immediate' : 'background',
  //     });
  //   });
  // }, [imagesData, prefetchDetection]);

  /**
   * 감지 프리패치를 브라우저 idle 시간에 스케줄링
   * - 우선순위(immediate) 요청은 즉시 수행
   */
  // const scheduleDetectionPrefetch = useCallback(
  //   (
  //     imageId: number,
  //     imageUrl: string,
  //     options?: { immediate?: boolean; persistAfterUnmount?: boolean }
  //   ) => {
  //     if (!imageId || !imageUrl) return;
  //     const runTask = () => {
  //       prefetchDetection(imageId, imageUrl, {
  //         priority: options?.immediate ? 'immediate' : 'background',
  //         persistAfterUnmount: options?.persistAfterUnmount ?? false,
  //       });
  //     };
  //     if (options?.immediate || typeof window === 'undefined') {
  //       runTask();
  //       return;
  //     }
  //     const idleCallback = (
  //       window as Window & {
  //         requestIdleCallback?: (callback: IdleRequestCallback) => number;
  //       }
  //     ).requestIdleCallback;
  //     if (idleCallback) {
  //       idleCallback(() => runTask());
  //       return;
  //     }
  //     window.setTimeout(runTask, 0);
  //   },
  //   [prefetchDetection]
  // );

  /**
   * 결과 페이지로 이동하며 필요한 감지 데이터를 선행 프리패치
   */
  // const handleViewResult = (history: MyPageImageHistory) => {
  //   const { houseId } = history;
  //   logMyPageClickBtnImgCard();
  //   const navigationState = buildResultNavigationState({
  //     history,
  //     userProfile: userProfile ?? null,
  //   });
  //   const params = new URLSearchParams({
  //     from: 'mypage',
  //     houseId: String(houseId),
  //   });
  //   navigate(`${ROUTES.GENERATE_RESULT}?${params.toString()}`, {
  //     state: navigationState,
  //   });
  //   // 네비게이션 직후 우선순위 감지 프리페치 실행
  //   scheduleDetectionPrefetch(history.imageId, history.generatedImageUrl, {
  //     immediate: true,
  //     persistAfterUnmount: true,
  //   });
  // };

  /**
   * 이미지 로드 완료 시 로컬 캐시를 갱신하고 프리패치 스케줄
   */
  // const handleImageLoad = useCallback(
  //   (imageId: number, imageUrl?: string) => {
  //     setLoadedImages((prev) => {
  //       if (prev[imageId]) return prev;
  //       const next = { ...prev, [imageId]: true };
  //       if (typeof window !== 'undefined') {
  //         sessionStorage.setItem('mypage-image-loaded', JSON.stringify(next));
  //       }
  //       return next;
  //     });
  //     if (imageUrl) {
  //       scheduleDetectionPrefetch(imageId, imageUrl, {
  //         immediate: primaryImageId === imageId,
  //       });
  //     }
  //   },
  //   [primaryImageId, scheduleDetectionPrefetch]
  // );

  // 로딩 중
  // if (isPending) {
  //   return <Loading />;
  // }

  // 에러 또는 데이터 없음
  // if (isError || !imagesListData) {
  //   return <EmptyStateSection type="generatedImages" />;
  // }

  // 이미지가 없을 때
  if (mockGeneratedImageList.groups.length === 0) {
    return <EmptyStateSection type="generatedImages" />;
  }

  const formatDate = (date: string) => {
    return date.replace(
      /(\d{4})-(\d{2})-(\d{2})/,
      (_, y, m, d) => `${y.slice(2)}.${m}.${d}`
    );
  };

  return (
    <section className={styles.wrapper}>
      {mockGeneratedImageList.groups.map((group, index) => (
        <div key={group.date}>
          {index > 0 && <div className={styles.divider} />}
          <div className={styles.groupContainer}>
            <div className={styles.date}>{formatDate(group.date)}</div>
            <div className={styles.listContainer}>
              {group.items.map((item) => (
                <GenImgCard
                  key={item.imageId}
                  cardType={item.viewType === 'CURATION' ? 'curation' : 'list'}
                  productSummaryText={item.productSummaryText}
                  imageUrl={item.generatedImageUrl}
                  usedProducts={item.usedProducts}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default GeneratedImagesSection;
