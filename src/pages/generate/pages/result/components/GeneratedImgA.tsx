import { useLocation, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
import type { MyPageImageDetailData } from '@/pages/mypage/types/apis/MyPage';

import Loading from '@components/loading/Loading';
import { useGetResultDataQuery } from '@pages/generate/hooks/useGenerate';

import * as styles from './GeneratedImg.css.ts';

import type {
  GenerateImageData,
  GenerateImageAResponse,
  GenerateImageBResponse,
} from '@pages/generate/types/generate';

// 통일된 타입 정의
type UnifiedGenerateImageResult = {
  imageInfoResponses: GenerateImageData[];
};

// 마이페이지 데이터를 GenerateImageData 형태로 변환하는 함수
const convertMypageDataToGenerateData = (
  mypageData: MyPageImageDetailData,
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
}

const GeneratedImgA = ({ result: propResult }: GeneratedImgAProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const swiper = useSwiper();

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

  // state 또는 API에서 가져온 데이터 사용 (API 호출이 필요한 경우만)
  if (shouldFetchFromAPI) {
    if (isFromMypage && mypageResult) {
      // 마이페이지에서는 단일 이미지 데이터를 배열로 변환
      const singleImageData = convertMypageDataToGenerateData(
        mypageResult,
        Number(imageId)
      );
      result = {
        imageInfoResponses: [singleImageData],
      };
    } else if (!isFromMypage && apiResult) {
      result = apiResult as
        | GenerateImageAResponse['data']
        | GenerateImageBResponse['data'];
    }
  }

  // 로딩 중이면 로딩 표시
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

  return (
    <div className={styles.container}>
      <Swiper
        slidesPerView={1}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
      >
        {/* <button onClick={() => swiper.slidePrev()}>prev</button> */}
        {images.map((image, index) => (
          <SwiperSlide key={`${image.imageId}-${index}`}>
            <img
              src={image.imageUrl}
              alt={`${image.name}님을 위한 맞춤 인테리어 스타일링`}
              className={styles.imgArea({ mirrored: image.isMirror })}
            />
          </SwiperSlide>
        ))}
        {/* <button onClick={() => swiper.slideNext()}>next</button> */}
      </Swiper>
    </div>
  );
};

export default GeneratedImgA;
