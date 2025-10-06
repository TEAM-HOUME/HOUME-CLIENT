import { useState, useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import type { MyPageImageDetail } from '@/pages/mypage/types/apis/MyPage';
import { ROUTES } from '@/routes/paths.ts';
import GeneralModal from '@/shared/components/overlay/modal/GeneralModal';

import Loading from '@components/loading/Loading';
import { useGetResultDataQuery } from '@pages/generate/hooks/useGenerate';
import LockIcon from '@shared/assets/icons/lockIcon.svg?react';
import SlideNext from '@shared/assets/icons/nextAbled.svg?react';
import SlideNextDisabled from '@shared/assets/icons/nextDisabled.svg?react';
import SlidePrev from '@shared/assets/icons/prevAbled.svg?react';
import SlidePrevDisabled from '@shared/assets/icons/prevDisabled.svg?react';
import Tag from '@shared/assets/icons/tagIcon.svg?react';

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

// 마이페이지 데이터를 GenerateImageData 형태로 변환하는 함수
const convertMypageDataToGenerateData = (
  mypageData: MyPageImageDetail,
  imageId: number
): GenerateImageData => {
  return {
    imageId,
    imageUrl: mypageData.generatedImageUrl,
    isMirror: false, // 마이페이지에서는 미러 정보를 제공하지 않음
    equilibrium: mypageData.equilibrium,
    houseForm: mypageData.houseForm,
    tagName: mypageData.tasteTag,
    name: mypageData.name,
  };
};

interface GeneratedImgAProps {
  result?:
    | UnifiedGenerateImageResult
    | GenerateImageAResponse['data']
    | GenerateImageBResponse['data'];
  onSlideChange?: (currentIndex: number, totalCount: number) => void;
  onCurrentImgIdChange?: (currentImgId: number) => void;
}

const GeneratedImgA = ({
  result: propResult,
  onSlideChange,
  onCurrentImgIdChange,
}: GeneratedImgAProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentImgId, setCurrentImgId] = useState(0);

  // 마이페이지 사용자 정보 (크레딧 정보 포함)
  const { data: userData } = useMyPageUser();

  // currentImgId가 변경될 때마다 부모에게 전달
  useEffect(() => {
    onCurrentImgIdChange?.(currentImgId);
  }, [currentImgId, onCurrentImgIdChange]);

  // 1차: prop으로 받은 데이터 사용
  let result = propResult;

  // 2차: location.state에서 데이터 가져오기 (정상적인 플로우)
  if (!result) {
    result = (
      location.state as {
        result?:
          | UnifiedGenerateImageResult
          | GenerateImageAResponse['data']
          | GenerateImageBResponse['data'];
      }
    )?.result;
  }

  // 3차: query parameter에서 imageId 가져와서 API 호출 (직접 접근 시)
  const imageId = searchParams.get('imageId');
  const from = searchParams.get('from');
  const isFromMypage = from === 'mypage';
  const shouldFetchFromAPI = !result && !!imageId;

  // 마이페이지에서 온 경우와 일반 생성 플로우에서 온 경우 구분
  const { data: apiResult, isLoading } = useGetResultDataQuery(
    Number(imageId || 0),
    {
      enabled: shouldFetchFromAPI && !isFromMypage,
    }
  );

  const { data: mypageResult, isLoading: mypageLoading } = useMyPageImageDetail(
    Number(imageId || 0),
    { enabled: shouldFetchFromAPI && isFromMypage }
  );

  // 마이페이지에서 온 경우 항상 히스토리 데이터 사용
  if (isFromMypage && mypageResult && mypageResult.histories.length > 0) {
    // 마이페이지에서는 모든 히스토리를 배열로 변환
    const allImageData = mypageResult.histories.map((history, index) =>
      convertMypageDataToGenerateData(history, Number(imageId) + index)
    );
    result = {
      imageInfoResponses: allImageData,
    };
  }
  // 일반 생성 플로우에서 온 경우
  else if (!isFromMypage && shouldFetchFromAPI && apiResult) {
    result = apiResult as
      | GenerateImageAResponse['data']
      | GenerateImageBResponse['data'];
  }

  useEffect(() => {
    if (
      result &&
      'imageInfoResponses' in result &&
      Array.isArray(result.imageInfoResponses)
    ) {
      const newImgId = result.imageInfoResponses[currentSlideIndex]?.imageId;
      setCurrentImgId(newImgId);
    }
  }, [currentSlideIndex, result]);

  if (!result && (isLoading || mypageLoading)) {
    return <Loading />;
  }

  // 여전히 데이터가 없으면 null 반환
  if (!result) {
    console.error('Result data is missing');
    return null;
  }

  // 데이터 타입에 따라 처리 - 이제 통일된 형태로 처리
  let images: GenerateImageData[] = [];

  if ('imageInfoResponses' in result) {
    // 통일된 형태 또는 A안: 다중 이미지 데이터
    images = result.imageInfoResponses;
  } else {
    // B안: 단일 이미지 데이터를 배열로 변환
    images = [result];
  }

  // 두 번째 이미지가 있는 경우 블러 처리된 추가 슬라이드를 생성
  const shouldAddBlurredSlide = images.length >= 2;
  const totalSlideCount = shouldAddBlurredSlide
    ? images.length + 1
    : images.length;

  const handleOpenModal = () => {
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
          onCancel={unmount}
          onConfirm={() => {
            unmount();
            navigate(ROUTES.GENERATE_START);
          }}
          onClose={unmount}
        />
      )
    );
  };

  return (
    <div className={styles.container}>
      <Swiper
        slidesPerView={1}
        onSlideChange={(swiper) => {
          setCurrentSlideIndex(swiper.activeIndex);
          onSlideChange?.(swiper.activeIndex, totalSlideCount);
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
          <SwiperSlide key={`${image.imageId}-${index}`}>
            <img
              src={image.imageUrl}
              alt={`${image.name}님을 위한 맞춤 인테리어 스타일링`}
              className={styles.imgArea({ mirrored: image.isMirror })}
            />
          </SwiperSlide>
        ))}
        {shouldAddBlurredSlide && (
          <SwiperSlide key="blurred-second-image">
            <div
              className={styles.imgAreaBlurred({
                mirrored: images[1].isMirror,
              })}
              style={{
                background: `url(${images[1].imageUrl}) lightgray 9.175px 11.881px / 96.774% 93.052% no-repeat`,
              }}
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
        <button type="button" className={styles.tagBtn}>
          <Tag />
        </button>
      </Swiper>
    </div>
  );
};

export default GeneratedImgA;
