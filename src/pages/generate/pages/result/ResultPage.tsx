import { useState, useEffect } from 'react';

// import { overlay } from 'overlay-kit';
import { useLocation, useSearchParams, Navigate } from 'react-router-dom';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
// import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import DislikeButton from '@/shared/components/button/likeButton/DislikeButton';
import LikeButton from '@/shared/components/button/likeButton/LikeButton';
// import Modal from '@/shared/components/overlay/modal/Modal';
// import HeadingText from '@/shared/components/text/HeadingText';

import Loading from '@components/loading/Loading';
import { useABTest } from '@pages/generate/hooks/useABTest';
import {
  // useFurnitureLogMutation,
  useResultPreferenceMutation,
  useFactorsQuery,
  useFactorPreferenceMutation,
  // useCreditLogMutation,
  useGetResultDataQuery,
} from '@pages/generate/hooks/useGenerate';

import GeneratedImgA from './components/GeneratedImgA.tsx';
import GeneratedImgB from './components/GeneratedImgB.tsx';
import * as styles from './ResultPage.css.ts';

import type {
  GenerateImageAResponse,
  GenerateImageBResponse,
  ResultPageLikeState,
  GenerateImageData,
} from '@pages/generate/types/generate';

// 통일된 타입 정의
type UnifiedGenerateImageResult = {
  imageInfoResponses: GenerateImageData[];
};

const ResultPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isMultipleImages } = useABTest();
  const [selectedFactors, setSelectedFactors] = useState<number[]>([]);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [currentImgId, setCurrentImgId] = useState(0);
  // 각 이미지별로 좋아요/싫어요 상태를 관리 (imageId를 키로 사용)
  const [imageLikeStates, setImageLikeStates] = useState<{
    [imageId: number]: ResultPageLikeState;
  }>({});

  // 1차: location.state에서 데이터 가져오기 (정상적인 플로우)
  let result = (
    location.state as {
      result?:
        | UnifiedGenerateImageResult
        | GenerateImageAResponse['data']
        | GenerateImageBResponse['data'];
    }
  )?.result;

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
    if (isFromMypage && mypageResult && mypageResult.histories.length > 0) {
      // 마이페이지에서는 모든 히스토리를 다중 이미지 구조로 변환
      console.log('mypageResult.histories', mypageResult.histories);
      const allImageData = mypageResult.histories.map((history, index) => ({
        imageId: Number(imageId) + index,
        imageUrl: history.generatedImageUrl,
        isMirror: false,
        equilibrium: history.equilibrium,
        houseForm: history.houseForm,
        tagName: history.tasteTag,
        name: history.name,
      }));
      result = {
        imageInfoResponses: allImageData,
      } as UnifiedGenerateImageResult;
    } else if (!isFromMypage && apiResult) {
      result = apiResult as
        | GenerateImageAResponse['data']
        | GenerateImageBResponse['data'];
    }
  }

  // result가 있을 때만 mutation hook들 호출
  const { mutate: sendPreference } = useResultPreferenceMutation();
  const { mutate: sendFactorPreference } = useFactorPreferenceMutation();
  // const { mutate: sendFurnituresLogs } = useFurnitureLogMutation();
  // const { mutate: sendCreditLogs } = useCreditLogMutation();

  // 요인 문구 데이터 가져오기 (좋아요용)
  const { data: likeFactorsData } = useFactorsQuery(true);

  // 요인 문구 데이터 가져오기 (싫어요용)
  const { data: dislikeFactorsData } = useFactorsQuery(false);

  // currentImgId가 변경될 때마다 로그 출력
  useEffect(() => {
    console.log('currentImgId 변경됨:', currentImgId);
  }, [currentImgId]);

  // 현재 슬라이드의 좋아요/싫어요 상태를 직접 계산
  const currentLikeState = (() => {
    // 1. 로컬 상태가 있으면 사용
    if (imageLikeStates[currentImgId]) {
      return imageLikeStates[currentImgId];
    }

    // 2. 마이페이지 히스토리에서 찾기
    if (isFromMypage && mypageResult?.histories) {
      const historyIndex = currentImgId - Number(imageId);
      const currentHistory = mypageResult.histories[historyIndex];
      if (currentHistory && currentHistory.isLike !== undefined) {
        return currentHistory.isLike ? 'like' : 'dislike';
      }
    }

    return null;
  })();

  // 디버깅용 로그
  console.log('=== ResultPage 렌더링 ===');
  console.log('currentImgId:', currentImgId);
  console.log('currentLikeState:', currentLikeState);
  console.log('imageLikeStates:', imageLikeStates);

  // 로딩 중이면 로딩 표시
  if (!result && (isLoading || mypageLoading)) {
    return <Loading />;
  }

  // 여전히 데이터가 없으면 홈으로 리다이렉션
  if (!result) {
    console.error('Result data is missing');
    return <Navigate to="/" replace />;
  }

  // // 이미지 ID 추출 (좋아요/싫어요 버튼용)
  // const getImageId = (slideIndex: number) => {
  //   if ('imageInfoResponses' in result) {
  //     // 통일된 형태 또는 A안: 다중 이미지의 경우
  //     return result.imageInfoResponses[slideIndex]?.imageId || 0;
  //   } else {
  //     // B안: 단일 이미지
  //     return result.imageId;
  //   }
  // };

  const handleVote = (isLike: boolean) => {
    const imageId = currentImgId;
    console.log('=== handleVote 호출 ===');
    console.log('currentImgId:', currentImgId);
    console.log('imageId:', imageId);
    console.log('isLike:', isLike);
    console.log('현재 imageLikeStates:', imageLikeStates);

    // 해당 이미지의 로컬 상태 즉시 업데이트
    setImageLikeStates((prev) => {
      const newStates = {
        ...prev,
        [imageId]: (isLike ? 'like' : 'dislike') as ResultPageLikeState,
      };
      console.log('업데이트된 imageLikeStates:', newStates);
      return newStates;
    });

    sendPreference({ imageId, isLike });
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

  // 태그 버튼 클릭 핸들러 추가
  const handleFactorClick = (factorId: number) => {
    const imageId = currentImgId;
    const isSelected = selectedFactors.includes(factorId);

    if (isSelected) {
      setSelectedFactors((prev) => prev.filter((id) => id !== factorId));
    } else {
      setSelectedFactors((prev) => [...prev, factorId]);
      sendFactorPreference({ imageId, factorId });
    }
  };

  const handleSlideChange = (currentIndex: number, totalCount: number) => {
    setIsLastSlide(currentIndex === totalCount - 1);
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.resultSection}>
        {/* A/B 테스트에 따라 다른 컴포넌트 렌더링 */}
        {isMultipleImages ? (
          <GeneratedImgA
            result={result}
            onSlideChange={handleSlideChange}
            onCurrentImgIdChange={setCurrentImgId}
          />
        ) : (
          <GeneratedImgB
            result={result}
            onCurrentImgIdChange={setCurrentImgId}
          />
        )}

        <div
          className={`${styles.buttonSection} ${isLastSlide ? styles.buttonSectionDisabled : ''}`}
        >
          <div className={styles.buttonBox}>
            <p className={styles.boxText}>이미지가 마음에 드셨나요?</p>
            <div className={styles.buttonGroup}>
              <LikeButton
                onClick={() => handleVote(true)}
                isSelected={currentLikeState === 'like'}
                typeVariant={'onlyIcon'}
                aria-label="이미지 좋아요 버튼"
              />
              <DislikeButton
                onClick={() => handleVote(false)}
                isSelected={currentLikeState === 'dislike'}
                typeVariant={'onlyIcon'}
                aria-label="이미지 싫어요 버튼"
              />
            </div>
            {currentLikeState === 'like' &&
              likeFactorsData &&
              likeFactorsData.length > 0 && (
                <div className={styles.tagGroup}>
                  <div className={styles.tagFlexItem}>
                    {likeFactorsData.slice(0, 2).map((factor) => (
                      <button
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          selectedFactors.includes(factor.id)
                            ? styles.tagButtonSelected
                            : ''
                        }`}
                        onClick={() => handleFactorClick(factor.id)}
                      >
                        {factor.text}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tagFlexItem}>
                    {likeFactorsData.slice(2, 4).map((factor) => (
                      <button
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          selectedFactors.includes(factor.id)
                            ? styles.tagButtonSelected
                            : ''
                        }`}
                        onClick={() => handleFactorClick(factor.id)}
                      >
                        {factor.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            {currentLikeState === 'dislike' &&
              dislikeFactorsData &&
              dislikeFactorsData.length > 0 && (
                <div className={styles.tagGroup}>
                  <div className={styles.tagFlexItem}>
                    {dislikeFactorsData.slice(0, 2).map((factor) => (
                      <button
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          selectedFactors.includes(factor.id)
                            ? styles.tagButtonSelected
                            : ''
                        }`}
                        onClick={() => handleFactorClick(factor.id)}
                      >
                        {factor.text}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tagFlexItem}>
                    {dislikeFactorsData.slice(2, 4).map((factor) => (
                      <button
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          selectedFactors.includes(factor.id)
                            ? styles.tagButtonSelected
                            : ''
                        }`}
                        onClick={() => handleFactorClick(factor.id)}
                      >
                        {factor.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPage;
