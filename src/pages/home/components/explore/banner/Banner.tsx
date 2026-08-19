import { useEffect, useMemo, useState } from 'react';

import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { useBannerListQuery } from '@pages/home/apis/queries/useBannerListQuery';

import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import { IMAGE_SIZES } from '@utils/imageVariant';

import * as styles from './Banner.css';

import type { Swiper as SwiperType } from 'swiper';

export type BannerSlide = {
  id: number;
  title: string;
  imageUrl: string;
};

const AUTO_PLAY_DELAY_MS = 2000;

type BannerProps = {
  seedBannerId: number;
  onSlideClick?: (slide: BannerSlide) => void;
  onBannerSwipe?: (direction: 'left' | 'right', slide: BannerSlide) => void;
};

const Banner = ({ seedBannerId, onSlideClick, onBannerSwipe }: BannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data } = useBannerListQuery(seedBannerId);

  useEffect(() => {
    setActiveIndex(0);
  }, [seedBannerId]);

  const slides: BannerSlide[] = useMemo(() => {
    const banners = data?.banners ?? [];
    return banners
      .filter((b) => b.id != null)
      .map((b) => ({
        id: b.id as number,
        title: b.name ?? '',
        imageUrl: b.imageUrl ?? '',
      }));
  }, [data?.banners]);

  const hasMultipleSlides = slides.length > 1;
  const currentSlide = slides[activeIndex] ?? slides[0];
  const showPlaceholder = slides.length === 0;

  return (
    <div className={styles.root}>
      <div className={styles.swiperWrapper}>
        {showPlaceholder ? (
          <div className={styles.slidePlaceholder} />
        ) : (
          <Swiper
            className={styles.bannerSwiper}
            modules={[Autoplay]}
            slidesPerView={1}
            loop={hasMultipleSlides}
            autoplay={
              hasMultipleSlides
                ? {
                    delay: AUTO_PLAY_DELAY_MS,
                    disableOnInteraction: false,
                  }
                : false
            }
            onSlideChange={(swiper: SwiperType) => {
              setActiveIndex(swiper.realIndex);
            }}
            onTouchEnd={(swiper: SwiperType) => {
              if (!onBannerSwipe || slides.length <= 1) return;
              // 임계값 미만 드래그(스냅백)는 슬라이드가 바뀌지 않음
              if (swiper.realIndex === swiper.previousIndex) return;

              const slide = slides[swiper.realIndex];
              if (!slide) return;

              const touchDiff = swiper.touches.diff;
              // 터치 이동 방향: 오른쪽 드래그 → 이전 배너, 왼쪽 드래그 → 다음 배너
              const direction: 'left' | 'right' =
                touchDiff > 0 ? 'left' : 'right';

              onBannerSwipe(direction, slide);
            }}
            onSwiper={(swiper: SwiperType) => {
              setActiveIndex(swiper.realIndex);
            }}
          >
            {slides.map((slide, index) => (
              <SwiperSlide
                key={slide.id}
                className={styles.swiperSlide}
                onClick={() => onSlideClick?.(slide)}
              >
                {slide.imageUrl ? (
                  <div className={styles.wrapper}>
                    <OptimizedImage
                      src={slide.imageUrl}
                      sizes={IMAGE_SIZES.full}
                      alt={slide.title}
                      className={styles.image}
                      placeholder="color"
                      draggable={false}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className={styles.gradientOverlay} />
                  </div>
                ) : (
                  <div className={styles.slidePlaceholder} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {slides.length > 0 && currentSlide && (
        <div className={styles.contentOverlay}>
          <div className={styles.content}>
            <h2 className={styles.title}>
              {currentSlide.title} <br /> 우리 집 스타일링하기
            </h2>
            <p className={styles.cta}>
              <Icon name="DoubleStar" size="16" /> 지금 바로 적용해보기
            </p>
          </div>
        </div>
      )}

      {slides.length > 0 && (
        <div className={styles.indicatorOverlay}>
          <div className={styles.indicator}>
            <span className={styles.indicatorCurrent}>{activeIndex + 1}</span>
            <span className={styles.indicatorSeparator}> | </span>
            <span className={styles.indicatorTotal}>{slides.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
