import { useLocation, useSearchParams } from 'react-router-dom';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
import type { MyPageImageDetailData } from '@/pages/mypage/types/apis/MyPage';

import Loading from '@components/loading/Loading';
import { useGetResultDataQuery } from '@pages/generate/hooks/useGenerate';

import * as styles from './GeneratedImg.css.ts';

import type { GenerateImageData } from '@pages/generate/types/generate';

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

interface GeneratedImgBProps {
  result?: GenerateImageData;
}

const GeneratedImgB = ({ result: propResult }: GeneratedImgBProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 1차: prop으로 받은 데이터 사용
  let result = propResult;

  // 2차: location.state에서 데이터 가져오기 (정상적인 플로우)
  if (!result) {
    result = (location.state as { result?: GenerateImageData })?.result;
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
      result = convertMypageDataToGenerateData(mypageResult, Number(imageId));
    } else if (!isFromMypage && apiResult) {
      result = apiResult as GenerateImageData;
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

  return (
    <div className={styles.container}>
      <img
        src={result.imageUrl}
        alt={`${result.name}님을 위한 맞춤 인테리어 스타일링`}
        className={styles.imgArea({ mirrored: result.isMirror })}
      />
    </div>
  );
};

export default GeneratedImgB;
