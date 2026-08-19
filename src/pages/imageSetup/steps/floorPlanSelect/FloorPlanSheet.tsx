import { useEffect, useRef } from 'react';

import clsx from 'clsx';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import {
  trackRoomTypeViewSheetArrowLeftClick,
  trackRoomTypeViewSheetArrowRightClick,
  trackRoomTypeViewSheetFlipClick,
} from '@pages/imageSetup/analytics/roomTypeAnalytics';

import type { ExploreHouseTemplateDetailItemResponse } from '@apis/__generated__/data-contracts';

import emptyImage from '@assets/images/ImgEmpty.png';

import CloseBottomSheet from '@components/bottomSheet/CloseBottomSheet';
import ActionButton from '@components/button/actionButton/ActionButton';
import IconButton from '@components/button/IconButton';
import OptimizedImage from '@components/image/OptimizedImage';

import { IMAGE_SIZES } from '@utils/imageVariant';

import * as styles from './FloorPlanSheet.css';
import { useFloorPlanSheet } from '../../hooks/useFloorPlanSheet';

import type { Swiper as SwiperType } from 'swiper';

interface FloorPlanSheetProps {
  open: boolean;
  onClose: () => void;
  floorPlanName: string;
  equilibrium: string;
  detailViews: ExploreHouseTemplateDetailItemResponse[];
  onConfirm: () => void;
}

const FloorPlanSheet = ({
  open,
  onClose,
  floorPlanName,
  equilibrium,
  detailViews,
  onConfirm,
}: FloorPlanSheetProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const {
    currentView,
    isMultiView,
    isMirror,
    toggleMirror,
    selectedViewIndex,
    setViewIndex,
  } = useFloorPlanSheet(detailViews);

  // 도면 상세 시트 마운트 후, 로그인 게이트에서 도면 상세 시트로 복귀 시, swiper API로 기존에 사용자가 선택했던 view로 이동
  // loop=true(=isMultiView)인 경우 복제된 슬라이드 때문에 activeIndex와 realIndex가 다르므로,
  // realIndex 기준으로 관리되는 selectedViewIndex를 정확히 따라가려면 slideToLoop을 사용해야 함
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.realIndex === selectedViewIndex) return;

    if (isMultiView) {
      swiper.slideToLoop(selectedViewIndex);
    } else {
      swiper.slideTo(selectedViewIndex);
    }
  }, [selectedViewIndex, isMultiView]);

  if (!currentView) return null;

  return (
    <CloseBottomSheet
      open={open}
      onClose={onClose}
      titleSlot={
        <div className={styles.titleRow}>
          <span className={styles.titleMain}>{floorPlanName}</span>
          <span className={styles.titleMeta}>·</span>
          <span className={styles.titleMeta}>{equilibrium}</span>
        </div>
      }
      contentSlot={
        <div className={styles.content}>
          <div className={styles.mirrorWrapper}>
            <div className={styles.swiperContainer}>
              <Swiper
                modules={[Navigation]}
                slidesPerView={1}
                loop={isMultiView}
                initialSlide={selectedViewIndex}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                // swiper.realIndex로 Swiper가 index를 알려주면
                // setViewIndex로 store 업데이트 -> currentView가 바뀌어 도면 뷰 라벨 갱신
                onSlideChange={(swiper) => {
                  setViewIndex(swiper.realIndex);
                }}
              >
                {detailViews.map((view, index) => (
                  <SwiperSlide key={`view-${index}`} className={styles.slide}>
                    <OptimizedImage
                      src={view.imageUrl ?? emptyImage}
                      sizes={IMAGE_SIZES.full}
                      fallbackSrc={emptyImage}
                      alt={`${floorPlanName} ${view.view}`}
                      className={clsx(
                        styles.slideImage,
                        isMirror && styles.mirrored
                      )}
                      placeholder="color"
                      draggable={false}
                      decoding="async"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              {isMultiView && (
                <>
                  <IconButton
                    name="ArrowLeftFill"
                    size="M"
                    aria-label="이전"
                    className={styles.navButtonPrev}
                    onClick={() => {
                      trackRoomTypeViewSheetArrowLeftClick();
                      swiperRef.current?.slidePrev();
                    }}
                  />
                  <IconButton
                    name="ArrowRightFill"
                    size="M"
                    aria-label="다음"
                    className={styles.navButtonNext}
                    onClick={() => {
                      trackRoomTypeViewSheetArrowRightClick();
                      swiperRef.current?.slideNext();
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <p className={styles.viewLabel}>{currentView.view}</p>
        </div>
      }
      primaryButton={
        <ActionButton size="2XL" fullWidth onClick={onConfirm}>
          공간 선택하기
        </ActionButton>
      }
      secondaryButton={
        <ActionButton
          variant="outlined"
          color="inverse"
          size="2XL"
          leftIcon="FlipHorizontal"
          onClick={() => {
            trackRoomTypeViewSheetFlipClick();
            toggleMirror();
          }}
        >
          좌우반전
        </ActionButton>
      }
    />
  );
};

export default FloorPlanSheet;
