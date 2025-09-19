import { useState, useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
import type { MyPageImageDetailData } from '@/pages/mypage/types/apis/MyPage';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import DislikeButton from '@/shared/components/button/likeButton/DislikeButton';
import LikeButton from '@/shared/components/button/likeButton/LikeButton';
import Modal from '@/shared/components/overlay/modal/Modal';
// import HeadingText from '@/shared/components/text/HeadingText';

import Loading from '@components/loading/Loading';
import {
  useFurnitureLogMutation,
  useResultPreferenceMutation,
  useCreditLogMutation,
  useGetResultDataQuery,
} from '@pages/generate/hooks/useGenerate';

import * as styles from './ResultPage.css.ts';

import type {
  GenerateImageData,
  ResultPageLikeState,
} from '@pages/generate/types/generate';

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

const ResultPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Hook들을 최상단에 배치
  const [selected, setSelected] = useState<ResultPageLikeState>(null);

  // 1차: location.state에서 데이터 가져오기 (정상적인 플로우)
  let result = (location.state as { result?: GenerateImageData })?.result;

  // 2차: query parameter에서 imageId 가져와서 API 호출 (직접 접근 시)
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

  // result가 있을 때만 mutation hook들 호출
  const { mutate: sendPreference } = useResultPreferenceMutation();
  const { mutate: sendFurnituresLogs } = useFurnitureLogMutation();
  const { mutate: sendCreditLogs } = useCreditLogMutation();

  // 마이페이지에서 온 경우 기존 isLike 상태를 버튼에 반영
  useEffect(() => {
    if (isFromMypage && mypageResult?.isLike !== undefined) {
      setSelected(mypageResult.isLike ? 'like' : 'dislike');
    }
  }, [isFromMypage, mypageResult?.isLike]);

  // 로딩 중이면 로딩 표시
  if (!result && (isLoading || mypageLoading)) {
    return <Loading />;
  }

  // 여전히 데이터가 없으면 홈으로 리다이렉션
  if (!result) {
    console.error('Result data is missing');
    return <Navigate to="/" replace />;
  }

  const handleVote = (isLike: boolean) => {
    setSelected(isLike ? 'like' : 'dislike');
    sendPreference({ imageId: result.imageId, isLike });
  };

  // const handleOpenModal = () => {
  //   overlay.open(({ unmount }) => (
  //     <Modal
  //       onClose={unmount}
  //       title={`스타일링 이미지대로 가구를\n추천 받으려면 크레딧이 필요해요`}
  //       onCreditAction={sendCreditLogs} // 크레딧 액션 콜백 전달
  //     />
  //   ));
  //   sendFurnituresLogs();
  // };

  // if (isLoading) return <div>로딩중</div>;
  // if (isError || !data) return <div>에러 발생!</div>;

  return (
    <div className={styles.wrapper}>
      <section className={styles.resultSection}>
        <img
          src={result.imageUrl}
          alt={`${result.name}님을 위한 맞춤 인테리어 스타일링`}
          className={styles.imgArea({ mirrored: result.isMirror })}
        />
        <div className={styles.buttonSection}>
          <div className={styles.buttonBox}>
            <p className={styles.boxText}>이미지가 마음에 드셨나요?</p>
            <div className={styles.buttonGroup}>
              <LikeButton
                size={'large'}
                onClick={() => handleVote(true)}
                isSelected={selected === 'like'}
              >
                만족스러워요
              </LikeButton>
              <DislikeButton
                size={'large'}
                onClick={() => handleVote(false)}
                isSelected={selected === 'dislike'}
              >
                아쉬워요
              </DislikeButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPage;
