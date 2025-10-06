import { useState, useEffect } from 'react';

import { useLocation, useSearchParams, Navigate } from 'react-router-dom';

import { useMyPageImageDetail } from '@/pages/mypage/hooks/useMypage';
import DislikeButton from '@/shared/components/button/likeButton/DislikeButton';
import LikeButton from '@/shared/components/button/likeButton/LikeButton';

import Loading from '@components/loading/Loading';
import { useABTest } from '@pages/generate/hooks/useABTest';
import {
  useResultPreferenceMutation,
  useDeleteResultPreferenceMutation,
  useFactorsQuery,
  useFactorPreferenceMutation,
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
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [currentImgId, setCurrentImgId] = useState(0);
  // 각 이미지별로 좋아요/싫어요 상태를 관리 (imageId를 키로 사용)
  const [imageLikeStates, setImageLikeStates] = useState<{
    [imageId: number]: ResultPageLikeState;
  }>({});
  // 각 이미지별로 factor 선택 상태를 관리 (imageId를 키로 사용)
  const [imageFactorStates, setImageFactorStates] = useState<{
    [imageId: number]: number | null;
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
  const { mutate: deletePreference } = useDeleteResultPreferenceMutation();
  const { mutate: sendFactorPreference } = useFactorPreferenceMutation();

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
    // 1. 로컬 상태가 있으면 사용 (null도 포함)
    if (imageLikeStates[currentImgId] !== undefined) {
      return imageLikeStates[currentImgId];
    }

    // 2. 마이페이지 히스토리에서 찾기
    if (isFromMypage && mypageResult?.histories) {
      const historyIndex = currentImgId - Number(imageId);
      const currentHistory = mypageResult.histories[historyIndex];
      if (currentHistory && currentHistory.isLike !== undefined) {
        // isLike가 null이면 null 반환, 그렇지 않으면 boolean 값에 따라 변환
        return currentHistory.isLike === null
          ? null
          : currentHistory.isLike
            ? 'like'
            : 'dislike';
      }
    }

    return null;
  })();

  // 현재 슬라이드의 선택된 factor ID를 직접 계산
  const currentFactorId = (() => {
    // 1. 로컬 상태가 있으면 사용 (null도 포함)
    if (imageFactorStates[currentImgId] !== undefined) {
      return imageFactorStates[currentImgId];
    }

    // 2. 마이페이지 히스토리에서 찾기
    if (isFromMypage && mypageResult?.histories) {
      const historyIndex = currentImgId - Number(imageId);
      const currentHistory = mypageResult.histories[historyIndex];
      if (currentHistory && currentHistory.factorId) {
        return currentHistory.factorId;
      }
    }

    return null;
  })();

  // 로딩 중이면 로딩 표시
  if (!result && (isLoading || mypageLoading)) {
    return <Loading />;
  }

  // 데이터 없으면 홈으로 리다이렉션
  if (!result) {
    console.error('Result data is missing');
    return <Navigate to="/" replace />;
  }

  const handleVote = (isLike: boolean) => {
    const imageId = currentImgId;

    // currentLikeState를 사용하여 현재 상태 확인
    const currentState = currentLikeState;
    const newState = isLike ? 'like' : 'dislike';

    // 같은 상태를 다시 클릭하면 취소 (null로 설정)
    const finalState = currentState === newState ? null : newState;

    // 좋아요/싫어요가 취소되면 factor 선택도 초기화
    if (finalState === null) {
      setImageFactorStates((prev) => ({
        ...prev,
        [imageId]: null,
      }));
      // 취소 요청 API 호출 (DELETE)
      deletePreference(imageId, {
        onSuccess: () => {
          setImageLikeStates((prev) => ({
            ...prev,
            [imageId]: null,
          }));
        },
        onError: (error) => {
          console.error('취소 API 실패:', error);
        },
      });
    } else {
      // 좋아요/싫어요 상태가 바뀌었다면 현재 선택된 factor 취소
      if (
        currentState !== null &&
        currentState !== newState &&
        currentFactorId
      ) {
        console.log(
          '좋아요/싫어요 상태 변경으로 factor 취소:',
          currentFactorId
        );
        sendFactorPreference({ imageId, factorId: currentFactorId });
        setImageFactorStates((prev) => ({
          ...prev,
          [imageId]: null,
        }));
      }

      // 새로운 선택 요청 API 호출
      const apiValue = finalState === 'like';
      sendPreference(
        { imageId, isLike: apiValue },
        {
          onSuccess: () => {
            setImageLikeStates((prev) => ({
              ...prev,
              [imageId]: finalState,
            }));
          },
          onError: (error) => {
            console.error('선택 API 실패:', error);
          },
        }
      );
    }
  };

  // 태그 버튼 클릭 핸들러 (좋아요/싫어요 상태 변경 시 factor 취소 및 선택)
  const handleFactorClick = (factorId: number) => {
    const imageId = currentImgId;
    const isSelected = currentFactorId === factorId;

    if (isSelected) {
      // 이미 선택된 factor를 다시 클릭하면 선택 해제
      sendFactorPreference(
        { imageId, factorId },
        {
          onSuccess: () => {
            setImageFactorStates((prev) => ({
              ...prev,
              [imageId]: null,
            }));
          },
          onError: (error) => {
            console.error('factor 취소 API 실패:', error);
          },
        }
      );
    } else {
      // 새로운 factor 선택
      sendFactorPreference(
        { imageId, factorId },
        {
          onSuccess: () => {
            setImageFactorStates((prev) => ({
              ...prev,
              [imageId]: factorId,
            }));
          },
          onError: (error) => {
            console.error('factor 선택 API 실패:', error);
          },
        }
      );
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
                        type="button"
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          currentFactorId === factor.id
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
                        type="button"
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          currentFactorId === factor.id
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
                        type="button"
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          currentFactorId === factor.id
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
                        type="button"
                        key={factor.id}
                        className={`${styles.tagButton} ${
                          currentFactorId === factor.id
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
