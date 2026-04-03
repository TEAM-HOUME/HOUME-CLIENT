import { useState, useEffect, useMemo } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import {
  useLocation,
  useNavigate,
  useSearchParams,
  Navigate,
} from 'react-router-dom';

import { useGetResultDataQuery } from '@pages/generate/apis/queries/useGetResultDataQuery';
import { IS_CLIENT_DETECTION_ENABLED } from '@pages/generate/constants/curationDetectionMode';
import { useABTest } from '@pages/generate/hooks/useABTest';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import type {
  GenerateImageAResponse,
  GenerateImageBResponse,
  GenerateImageData,
} from '@pages/generate/types/generate';
import { useMyPageImageDetailQuery } from '@pages/mypage/apis/queries/useMyPageImageDetailQuery';
import type {
  MyPageImageDetail,
  MyPageImageHistory,
} from '@pages/mypage/types/apis/MyPage';
import { createImageDetailPlaceholder } from '@pages/mypage/utils/resultNavigation';

import { ROUTES } from '@routes/paths';

import { RESULT_TYPE, useImageFlowStore } from '@store/useImageFlowStore';

import type { DetectionCacheEntry } from '@shared/detection/stores/useDetectionCacheStore';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/navBar/TitleNavBar';

import { getCanHistoryGoBack } from '@utils/history';

import GeneratedImgA from './components/GeneratedImgA';
import GeneratedImgB from './components/GeneratedImgB';
import CurationSection from './curationSection/CurationSection';
import * as styles from './ResultPage.css';

// 통일된 타입 정의
type UnifiedGenerateImageResult = {
  imageInfoResponses: GenerateImageData[];
};

/**
 * 마이페이지 히스토리 데이터를 결과 페이지 이미지 포맷으로 변환
 * @param history 마이페이지 히스토리 객체(history item)
 * @returns 결과 페이지에서 사용하는 이미지 데이터(generate image data)
 */
const toGenerateImageData = (
  history: MyPageImageHistory
): GenerateImageData => ({
  imageId: history.imageId,
  imageUrl: history.generatedImageUrl,
  isMirror: false,
  equilibrium: history.equilibrium,
  houseForm: history.houseForm,
  tagName: history.tasteTag,
  name: history.tasteTag,
});

/**
 * 결과(Result) 페이지
 * - 전달된 state 또는 houseId 기반으로 생성 결과를 결정
 * - A/B 테스트 플래그에 따라 단일/다중 결과 컴포넌트 분기
 */
const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMultipleImages } = useABTest();
  const [currentImgId, setCurrentImgId] = useState(0);
  const [_currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const setActiveImage = useCurationStore((state) => state.setActiveImage);
  const resetCuration = useCurationStore((state) => state.resetAll);
  const activeImageIdInStore = useCurationStore((state) => state.activeImageId);

  // 1차: location.state에서 데이터 가져오기 (정상적인 플로우)
  const locationState = location.state as {
    result?:
      | UnifiedGenerateImageResult
      | GenerateImageAResponse['data']
      | GenerateImageBResponse['data'];
    initialHistory?: MyPageImageHistory | null;
    cachedDetection?: DetectionCacheEntry | null;
  };
  const forwardedResult = locationState?.result ?? null;
  const initialHistory = locationState?.initialHistory ?? null;
  const forwardedDetection = locationState?.cachedDetection ?? null;
  const initialImageId = initialHistory?.imageId ?? null;
  const forwardedDetectionMap = useMemo<Record<
    number,
    DetectionCacheEntry
  > | null>(() => {
    if (!forwardedDetection || !initialImageId) return null;
    return {
      [initialImageId]: forwardedDetection,
    };
  }, [forwardedDetection, initialImageId]);

  // 2차: query parameter에서 houseId 가져와서 API 호출 (직접 접근 시)
  const rawHouseId = searchParams.get('houseId');
  const from = searchParams.get('from');
  const isFromMypage = from === 'mypage';
  const trimmedHouseId = rawHouseId?.trim() ?? null;
  const parsedHouseId =
    trimmedHouseId !== null &&
    /^[1-9]\d*$/.test(trimmedHouseId) &&
    Number.isSafeInteger(Number(trimmedHouseId))
      ? Number(trimmedHouseId)
      : null;
  const hasValidHouseId = parsedHouseId !== null;
  const hasInitialResult = Boolean(forwardedResult || initialHistory);
  const shouldFetchExternalResult =
    !hasInitialResult && hasValidHouseId && !isFromMypage;
  const shouldFetchMypageDetail = hasValidHouseId && isFromMypage;
  const groupId = parsedHouseId;
  const detailPlaceholder =
    shouldFetchMypageDetail && initialHistory
      ? createImageDetailPlaceholder(initialHistory)
      : null;

  // 마이페이지에서 온 경우와 일반 생성 플로우에서 온 경우 구분
  const {
    data: apiResult,
    isLoading: isPending,
    isError: isResultError,
  } = useGetResultDataQuery(parsedHouseId ?? 0, {
    enabled: shouldFetchExternalResult,
  });

  const mypageDetailQuery = useMyPageImageDetailQuery(parsedHouseId ?? 0, {
    enabled: shouldFetchMypageDetail,
    placeholderData: detailPlaceholder ? () => detailPlaceholder : undefined,
  });
  const mypageResult = mypageDetailQuery.data;
  const mypageHistories: MyPageImageDetail[] | null =
    mypageResult?.histories ?? null;
  const mypageLoading = mypageDetailQuery.isLoading;
  const isSlideCountReady =
    !shouldFetchMypageDetail ||
    (!mypageDetailQuery.isLoading && !mypageDetailQuery.isPlaceholderData);
  const isSlideCountLoading = !isSlideCountReady;

  const resolvedResult = useMemo(() => {
    if (isFromMypage && mypageHistories && mypageHistories.length > 0) {
      const allImageData = mypageHistories.map(
        (history: MyPageImageDetail) => ({
          imageId: history.imageId,
          imageUrl: history.generatedImageUrl,
          isMirror: false,
          equilibrium: history.equilibrium,
          houseForm: history.houseForm,
          tagName: history.tasteTag,
          name: history.name,
        })
      );
      return {
        imageInfoResponses: allImageData,
      } as UnifiedGenerateImageResult;
    }
    if (forwardedResult) {
      return forwardedResult;
    }
    if (initialHistory) {
      return {
        imageInfoResponses: [toGenerateImageData(initialHistory)],
      } as UnifiedGenerateImageResult;
    }
    if (apiResult) {
      return apiResult as
        | GenerateImageAResponse['data']
        | GenerateImageBResponse['data'];
    }
    return null;
  }, [
    apiResult,
    forwardedResult,
    initialHistory,
    isFromMypage,
    mypageHistories,
  ]);
  const result = resolvedResult;

  useEffect(() => {
    // 유효한 이미지 id일 때만 큐레이션 활성화 상태 갱신
    if (currentImgId <= 0) {
      if (activeImageIdInStore !== null) {
        setActiveImage(null);
      }
      return;
    }
    if (activeImageIdInStore !== currentImgId) {
      setActiveImage(currentImgId);
    }
  }, [currentImgId, activeImageIdInStore, setActiveImage]);

  useEffect(() => {
    return () => {
      resetCuration();
    };
  }, [resetCuration]);

  const handleSlideChange = (currentIndex: number) => {
    setCurrentSlideIndex(currentIndex);
  };

  // 뒤로가기 로직 (GeneratePage에서 이관)
  const handleBackClick = () => {
    if (isFromMypage) {
      if (getCanHistoryGoBack()) {
        navigate(-1);
      } else {
        navigate(ROUTES.MYPAGE, { replace: true });
      }
    } else {
      navigate(ROUTES.HOME);
    }
  };

  // 로딩 중이면 로딩 표시
  if (!result && (isPending || mypageLoading)) {
    return (
      <main className={styles.pageLayout}>
        <TitleNavBar
          title="스타일링 이미지 생성"
          isBackIcon={true}
          isLoginBtn={false}
          onBackClick={handleBackClick}
        />
        <Loading />
      </main>
    );
  }

  // API 에러 시 인라인 에러 표시
  if (isResultError && !result) {
    return (
      <main className={styles.pageLayout}>
        <TitleNavBar
          title="스타일링 이미지 생성"
          isBackIcon={true}
          isLoginBtn={false}
          onBackClick={handleBackClick}
        />
        <InlineError message="결과를 불러올 수 없습니다" />
      </main>
    );
  }

  // 데이터 없으면 홈으로 리다이렉션
  if (!result) {
    console.error('Result data is missing');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <main className={styles.pageLayout}>
      <TitleNavBar
        title="스타일링 이미지 생성"
        isBackIcon={true}
        isLoginBtn={false}
        onBackClick={handleBackClick}
      />
      <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
        <div className={styles.wrapper}>
          <section className={styles.resultSection}>
            {/* A/B 테스트에 따라 다른 컴포넌트 렌더링 */}
            {isMultipleImages ? (
              <GeneratedImgA
                result={result}
                onSlideChange={handleSlideChange}
                onCurrentImgIdChange={setCurrentImgId}
                shouldInferHotspots={IS_CLIENT_DETECTION_ENABLED}
                detectionCache={forwardedDetectionMap ?? undefined}
                isSlideCountLoading={isSlideCountLoading}
              />
            ) : (
              <GeneratedImgB
                result={result}
                onCurrentImgIdChange={setCurrentImgId}
                shouldInferHotspots={IS_CLIENT_DETECTION_ENABLED}
                detectionCache={forwardedDetectionMap ?? undefined}
              />
            )}
            <CurationSection groupId={groupId} />
            {/* TODO: 상품 탭 UI(B-9) 완성 후 상세 구현 */}
            {useImageFlowStore.getState().resultType === RESULT_TYPE.LIST && (
              <button
                onClick={() => {
                  navigate(ROUTES.HOME);
                }}
              >
                상품 다시 선택하기
              </button>
            )}
          </section>
        </div>
      </ErrorBoundary>
    </main>
  );
};

export default ResultPage;
