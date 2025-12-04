import { useState, useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useABTest } from '@/pages/generate/hooks/useABTest';
import { useOpenCurationSheet } from '@/pages/generate/hooks/useFurnitureCuration';
import {
  logResultImgClickBtnMoreImg,
  logResultImgClickBtnTag,
  logResultImgClickMoreModalBack,
  logResultImgClickMoreModalMakeNew,
  logResultImgSwipeSlideLeft,
  logResultImgSwipeSlideRight,
} from '@/pages/generate/utils/analytics';
import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { ROUTES } from '@/routes/paths.ts';
import GeneralModal from '@/shared/components/overlay/modal/GeneralModal';

import LockIcon from '@shared/assets/icons/lockIcon.svg?react';
import SlideNext from '@shared/assets/icons/nextAbled.svg?react';
import SlideNextDisabled from '@shared/assets/icons/nextDisabled.svg?react';
import SlidePrev from '@shared/assets/icons/prevAbled.svg?react';
import SlidePrevDisabled from '@shared/assets/icons/prevDisabled.svg?react';
import Tag from '@shared/assets/icons/tagIcon.svg?react';

import DetectionHotspots from './DetectionHotspots';
import * as styles from './GeneratedImg.css.ts';

import type {
  GenerateImageData,
  GenerateImageAResponse,
  GenerateImageBResponse,
} from '@pages/generate/types/generate';
import type { Swiper as SwiperType } from 'swiper';

// 통일된 타입 정의
type UnifiedGenerateImageResult = {
  imageInfoResponses: GenerateImageData[];
};

interface GeneratedImgAProps {
  result:
    | UnifiedGenerateImageResult
    | GenerateImageAResponse['data']
    | GenerateImageBResponse['data'];
  onSlideChange?: (currentIndex: number, totalCount: number) => void;
  onCurrentImgIdChange?: (currentImgId: number) => void;
  shouldInferHotspots?: boolean;
}

const GeneratedImgA = ({
  result: propResult,
  onSlideChange,
  onCurrentImgIdChange,
  shouldInferHotspots = true,
}: GeneratedImgAProps) => {
  const navigate = useNavigate();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentImgId, setCurrentImgId] = useState(0);
  const openSheet = useOpenCurationSheet();
  const { variant } = useABTest();

  // 마이페이지 사용자 정보 (크레딧 정보 포함)
  const { data: userData } = useMyPageUser();

  // currentImgId가 변경될 때마다 부모에게 전달
  useEffect(() => {
    onCurrentImgIdChange?.(currentImgId);
  }, [currentImgId, onCurrentImgIdChange]);

  // 부모로부터 받은 데이터 사용 (필수 prop)
  const result = propResult;

  useEffect(() => {
    if (
      result &&
      'imageInfoResponses' in result &&
      Array.isArray(result.imageInfoResponses)
    ) {
      const newImgId = result.imageInfoResponses[currentSlideIndex]?.imageId;
      setCurrentImgId(newImgId ?? 0);
    }
  }, [currentSlideIndex, result]);

  // 데이터 타입에 따라 처리 - 이제 통일된 형태로 처리
  let images: GenerateImageData[] = [];

  if ('imageInfoResponses' in result) {
    // 통일된 형태 또는 A안: 다중 이미지 데이터
    images = result.imageInfoResponses;
  } else {
    // B안: 단일 이미지 데이터를 배열로 변환
    images = [result];
  }

  const lastImage = images[images.length - 1];
  const totalSlideCount = lastImage ? images.length + 1 : images.length;

  const handleOpenModal = () => {
    logResultImgClickBtnMoreImg(variant);
    overlay.open(
      (
        { unmount } // @toss/overlay-kit 사용
      ) => (
        <GeneralModal
          title="더 다양한 이미지가 궁금하신가요?"
          content={`새로운 취향과 정보를 반영해 다시 생성해보세요!\n이미지를 생성할 때마다 크레딧이 1개 소진돼요.`}
          cancelText="돌아가기"
          confirmText="이미지 새로 만들기"
          cancelVariant="default"
          confirmVariant="primary"
          showCreditChip={true}
          creditCount={userData?.CreditCount || 0}
          maxCredit={5}
          onCancel={() => {
            logResultImgClickMoreModalBack(variant);
            unmount();
          }}
          onConfirm={() => {
            logResultImgClickMoreModalMakeNew(variant);
            unmount();
            navigate(ROUTES.GENERATE_START);
          }}
          onClose={() => {
            logResultImgClickMoreModalBack(variant);
            unmount();
          }}
        />
      )
    );
  };

  return (
    <div className={styles.container}>
      <Swiper
        slidesPerView={1}
        onSlideChange={(swiper) => {
          const prevIndex = currentSlideIndex;
          const newIndex = swiper.activeIndex;
          setCurrentSlideIndex(newIndex);
          onSlideChange?.(newIndex, totalSlideCount);

          // 슬라이드 스와이프 이벤트 전송
          if (newIndex > prevIndex) {
            logResultImgSwipeSlideRight(variant);
          } else if (newIndex < prevIndex) {
            logResultImgSwipeSlideLeft(variant);
          }
        }}
        onSwiper={setSwiper}
      >
        <div className={styles.slideNum}>
          <span>{currentSlideIndex + 1}</span>
          <span>/</span>
          <span>{totalSlideCount}</span>
        </div>
        <button
          type="button"
          onClick={() => swiper?.slidePrev()}
          className={styles.slidePrevBtn}
          disabled={!swiper || currentSlideIndex === 0}
        >
          {currentSlideIndex === 0 ? <SlidePrevDisabled /> : <SlidePrev />}
        </button>
        {images.map((image, index) => (
          <SwiperSlide
            key={`${image.imageId}-${index}`}
            className={styles.swiperSlide}
          >
            <DetectionHotspots
              imageId={image.imageId}
              imageUrl={image.imageUrl}
              mirrored={image.isMirror}
              // 결과 페이지 플래그로 추론 on/off 제어
              shouldInferHotspots={shouldInferHotspots}
            />
          </SwiperSlide>
        ))}
        {lastImage && (
          <SwiperSlide key="blurred-last-image" className={styles.swiperSlide}>
            <img
              crossOrigin="anonymous"
              src={lastImage.imageUrl}
              alt="이미지 더보기"
              className={styles.imgAreaBlurred({
                mirrored: lastImage.isMirror,
              })}
            />
            <div className={styles.lockWrapper}>
              <LockIcon />
              <button
                type="button"
                className={styles.moreBtn}
                onClick={handleOpenModal}
              >
                이미지 더보기
              </button>
            </div>
          </SwiperSlide>
        )}
        <button
          type="button"
          onClick={() => swiper?.slideNext()}
          className={styles.slideNextBtn}
          disabled={!swiper || currentSlideIndex === totalSlideCount - 1}
        >
          {currentSlideIndex === totalSlideCount - 1 ? (
            <SlideNextDisabled />
          ) : (
            <SlideNext />
          )}
        </button>
        <button
          type="button"
          className={styles.tagBtn}
          onClick={() => {
            logResultImgClickBtnTag(variant);
            openSheet('expanded');
          }}
        >
          <Tag />
        </button>
      </Swiper>
    </div>
  );
};

export default GeneratedImgA;
