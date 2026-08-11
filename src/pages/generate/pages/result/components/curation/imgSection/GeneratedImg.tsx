import { useState, useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import generateResultLockedPreview from '@assets/images/generateResultLockedPreview.png';

import ActionButton from '@components/button/actionButton/ActionButton';
import IconButton from '@components/button/IconButton';
import OptimizedImage from '@components/image/OptimizedImage';
import { openImageZoom } from '@components/imageZoom/openImageZoom';
import CommunityComingSoonModal from '@components/overlay/modal/CommunityComingSoonModal';

import * as styles from './GeneratedImg.css';

import type { ResultImageMeta } from '../../../types';
import type { Swiper as SwiperType } from 'swiper';

export interface GeneratedImgCurationProps {
  images: ResultImageMeta[];
  onCurrentImgIdChange?: (currentImgId: number) => void;
  onSlideChange?: (slideIndex: number) => void;
  onArrowLeftClick?: () => void;
  onArrowRightClick?: () => void;
  onMoreImgClick?: () => void;
}

const GeneratedImg = ({
  images,
  onCurrentImgIdChange,
  onSlideChange,
  onArrowLeftClick,
  onArrowRightClick,
  onMoreImgClick,
}: GeneratedImgCurationProps) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const lastImage = images[images.length - 1];
  const hasLockedSlide = Boolean(lastImage);
  const totalSlideCount = hasLockedSlide ? images.length + 1 : images.length;

  const resolvedImgId =
    currentSlideIndex < images.length
      ? images[currentSlideIndex]?.imageId
      : lastImage?.imageId;

  useEffect(() => {
    if (typeof resolvedImgId === 'number' && Number.isFinite(resolvedImgId)) {
      onCurrentImgIdChange?.(resolvedImgId);
    }
  }, [resolvedImgId, onCurrentImgIdChange]);

  const isPrevDisabled = !swiper || currentSlideIndex === 0;
  const isNextDisabled =
    !swiper || currentSlideIndex === Math.max(0, totalSlideCount - 1);

  const handleOpenModal = () => {
    onMoreImgClick?.();
    overlay.open(({ unmount }) => (
      <CommunityComingSoonModal onClose={unmount} />
    ));
  };

  const handleOpenZoom = (target: ResultImageMeta) => {
    if (!target.imageUrl) return;
    openImageZoom({ src: target.imageUrl, isMirror: target.isMirror });
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sliderArea}>
        <Swiper
          slidesPerView={1}
          onSlideChange={(swiperInstance) => {
            const index = swiperInstance.activeIndex;
            setCurrentSlideIndex(index);
            onSlideChange?.(index);
          }}
          onSwiper={setSwiper}
        >
          <div className={styles.slidePrevBtnWrap}>
            <IconButton
              name="ArrowLeftFill"
              size="M"
              className={styles.slideNavBtn}
              disabled={isPrevDisabled}
              onClick={() => {
                onArrowLeftClick?.();
                swiper?.slidePrev();
              }}
              aria-label="이전 이미지"
            />
          </div>
          {images.map((image, index) => (
            <SwiperSlide
              key={`${image.imageId}-${index}`}
              className={styles.swiperSlide}
            >
              <div
                className={styles.zoomTrigger}
                role="button"
                tabIndex={0}
                aria-label="생성된 이미지 확대해서 보기"
                onClick={() => handleOpenZoom(image)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenZoom(image);
                  }
                }}
              >
                <OptimizedImage
                  src={image.imageUrl}
                  alt=""
                  placeholder="color"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={styles.imgArea({ mirrored: image.isMirror })}
                />
              </div>
            </SwiperSlide>
          ))}
          {lastImage && (
            <SwiperSlide key="locked-preview" className={styles.swiperSlide}>
              <img
                src={generateResultLockedPreview}
                alt=""
                className={styles.lockedPreviewImg}
              />
              <div className={styles.lockWrapper}>
                <div className={styles.lockTextBox}>
                  <p>나와 취향이 비슷한</p>
                  <p>유저들이 만든 이미지도 궁금하신가요?</p>
                </div>
                <ActionButton
                  variant="solid"
                  color="primary"
                  size="L"
                  onClick={handleOpenModal}
                >
                  이미지 더보기
                </ActionButton>
              </div>
            </SwiperSlide>
          )}
          <div className={styles.slideNextBtnWrap}>
            <IconButton
              name="ArrowRightFill"
              size="M"
              className={styles.slideNavBtn}
              disabled={isNextDisabled}
              onClick={() => {
                onArrowRightClick?.();
                swiper?.slideNext();
              }}
              aria-label="다음 이미지"
            />
          </div>
        </Swiper>
      </div>
    </div>
  );
};

export default GeneratedImg;
