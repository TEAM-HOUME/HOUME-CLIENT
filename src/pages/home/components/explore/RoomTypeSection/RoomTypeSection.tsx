import { useEffect, useMemo, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  getHomeSpaceCardParamsFromDetail,
  trackHomeSpaceCardClick,
  trackHomeSpaceCardSlideScroll,
  trackHomeSpaceMoreCardClick,
  trackHomeSpaceMoreClick,
} from '@pages/home/analytics/homeAnalytics';
import { getHouseTemplateDetail } from '@pages/imageSetup/v2/apis/queries/useHouseTemplateDetailQuery';
import { useHouseTemplatesQuery } from '@pages/imageSetup/v2/apis/queries/useHouseTemplatesQuery';

import { ROUTES } from '@routes/paths';

import { useImageFlowStore } from '@store/useImageFlowStore';

import type { ExploreHouseTemplateDetailResponse } from '@apis/__generated__/data-contracts';

import RoomTypeCard from '@components/v2/roomTypeCard/RoomTypeCard';

import { queryKeys } from '@constants/queryKey';

import TextButton from '@/shared/components/v2/btnText/TextButton';

import * as styles from './RoomTypeSection.css';

type RoomTypeSectionProps = {
  hasPreviousImage?: boolean;
  hasPreviousSpace?: boolean;
};

const RoomTypeSection = ({
  hasPreviousImage = false,
  hasPreviousSpace = false,
}: RoomTypeSectionProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data } = useHouseTemplatesQuery({ size: 4 });
  const floorPlans = useMemo(() => data?.floorPlans ?? [], [data?.floorPlans]);

  useEffect(() => {
    floorPlans.forEach((plan) => {
      if (plan.id == null) return;

      void queryClient.prefetchQuery({
        queryKey: queryKeys.imageSetup.houseTemplateDetail(plan.id),
        queryFn: () => getHouseTemplateDetail(plan.id as number),
      });
    });
  }, [floorPlans, queryClient]);

  const navigateToImageSetup = () => {
    useImageFlowStore.getState().startFlow({ route: 'FLOOR_PLAN' });
    navigate(ROUTES.IMAGE_SETUP);
  };

  const handleMoreClick = () => {
    trackHomeSpaceMoreClick();
    navigateToImageSetup();
  };

  const handleMoreCardClick = () => {
    trackHomeSpaceMoreCardClick();
    navigateToImageSetup();
  };

  const handleFloorPlanClick = async (floorPlanId: number | undefined) => {
    if (floorPlanId === undefined) return;

    const floorPlan = floorPlans.find((item) => item.id === floorPlanId);

    let detail = queryClient.getQueryData<ExploreHouseTemplateDetailResponse>(
      queryKeys.imageSetup.houseTemplateDetail(floorPlanId)
    );

    if (!detail) {
      try {
        detail = await queryClient.fetchQuery({
          queryKey: queryKeys.imageSetup.houseTemplateDetail(floorPlanId),
          queryFn: () => getHouseTemplateDetail(floorPlanId),
        });
      } catch {
        detail = undefined;
      }
    }

    trackHomeSpaceCardClick({
      spaceId: floorPlanId,
      spaceName: floorPlan?.name ?? detail?.floorPlanName,
      ...getHomeSpaceCardParamsFromDetail(detail),
      hasPreviousImage,
      hasPreviousSpace,
    });

    useImageFlowStore.getState().startFlow({
      route: 'FLOOR_PLAN',
      presetFloorPlanId: floorPlanId,
    });
    navigate(ROUTES.IMAGE_SETUP);
  };

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  const handleCardScroll = () => {
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
    }

    scrollDebounceRef.current = setTimeout(() => {
      trackHomeSpaceCardSlideScroll();
    }, 300);
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>우리 집 공간으로 시작하기</h2>
        <TextButton
          color="secondary"
          size="s"
          rightIcon="ArrowRight"
          onClick={handleMoreClick}
        >
          더보기
        </TextButton>
      </div>
      <div className={styles.cardScroll} onScroll={handleCardScroll}>
        <div className={styles.cardList}>
          {floorPlans.map((floorPlan) => (
            <div key={floorPlan.id} className={styles.cardItem}>
              <RoomTypeCard
                type="default"
                size="s"
                label={floorPlan.name ?? ''}
                imageSrc={floorPlan.imageUrl ?? ''}
                onClick={() => handleFloorPlanClick(floorPlan.id)}
              />
            </div>
          ))}
          <div className={styles.cardItem}>
            <RoomTypeCard type="more" size="s" onClick={handleMoreCardClick} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomTypeSection;
