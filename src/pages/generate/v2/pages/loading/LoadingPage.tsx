import { useCallback, useEffect, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { overlay } from 'overlay-kit';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, useNavigate } from 'react-router-dom';

import {
  trackLoadImgCardPreferenceClick,
  trackLoadImgCardPreferenceView,
  trackLoadImgMdGenImgQuitView,
  trackLoadImgPageBackSwipe,
  trackLoadImgPageRefresh,
} from '@pages/generate/analytics/loadImgAnalytics';
import { useStackDataQuery } from '@pages/generate/v2/apis/queries/useStackDataQuery';
import LikeButton from '@pages/generate/v2/components/likeButton/LikeButton';
import { useGenerateStore } from '@pages/generate/v2/stores/useGenerateStore';

import { ROUTES } from '@routes/paths';

import { FLOW_CONFIG } from '@store/imageFlow/flowConfig';
import { useImageFlowStore } from '@store/useImageFlowStore';

import {
  trackGenImgQuitMdKeepClick,
  trackGenImgQuitMdQuitClick,
} from '@shared/analytics/componentAnalytics';
import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { getEntryRoute } from '@shared/analytics/utils/imageEntryRoute';
import {
  ensureShortFunnelFlowSnapshot,
  getLoadImgReturnScreenName,
} from '@shared/analytics/utils/imageFlow';
import { isDocumentReloadOnPath } from '@shared/analytics/utils/isDocumentReloadOnPath';
import { loginStatusParams } from '@shared/analytics/utils/loginStatus';
import { TOASTER_ID, TOAST_TYPE } from '@shared/types/toast';

import type { GetCarouselResponseDTO } from '@apis/__generated__/data-contracts';

import TestImg from '@assets/v2/images/TestImg.png';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';
import OptimizedImage from '@components/image/OptimizedImage';
import Loading from '@components/loading/Loading';
import Popup from '@components/v2/popup/Popup';
import { useToast } from '@components/v2/toast/useToast';

import { TOAST_MESSAGE } from '@constants/toastMessage';

import { useExitBlocker } from '@hooks/useExitBlocker';

import { useExitImageFlow } from './hooks/useExitImageFlow';
import { useGenerateImageRequest } from './hooks/useGenerateImageRequest';
import * as styles from './LoadingPage.css';
import ProgressBar from './ProgressBar';
import { usePostCarouselLikeMutation } from '../../apis/mutations/useCarouselLikeMutation';
import Tooltip from '../../components/tooltip/Tooltip';

const ANIMATION_DURATION = 600; // 캐러셀 애니메이션 지속 시간 (ms)
const IMAGE_GENERATION_ERROR_CODES = new Set([50013, 50017, 50400]);

const isImageGenerationServerError = (error: unknown) => {
  if (!isAxiosError(error)) return false;

  const code = error.response?.data?.code;

  return typeof code === 'number' && IMAGE_GENERATION_ERROR_CODES.has(code);
};

// TODO: 커스텀 훅, 유틸함수로 빼기, 기능 별 커스텀 훅 분할 시급
const LoadingPage = () => {
  const navigate = useNavigate();
  const { notify } = useToast();

  // 툴팁
  const [isTooltipOpen, setIsTooltipOpen] = useState(true);

  // Zustand store: 이미지 생성 완료 상태 및 결과 데이터
  // TODO: 해당 store는 props로 대체 가능, 없애기
  const { isApiCompleted, navigationData, resetGenerate } = useGenerateStore();

  // 이미지 생성 플로우 이탈 시 sessionStorage/store 정리 핸들러
  // (mutation 응답 전에 사용자가 빠져나가는 경우, store가 그대로 남아 같은 데이터로 mutation이 재실행되는 것을 막기 위함)
  const exitImageFlow = useExitImageFlow();

  // LoadingPage 이탈 가드 — 브라우저 뒤로가기/NavBar 뒤로가기/모바일 스와이프 모두 가로채서 confirm 모달 표시
  // - GENERATE_RESULT, HOME, LOGIN 으로의 navigation은 화이트리스트로 통과
  //   - GENERATE_RESULT: 이미지 생성 정상 완료 시 LoadingPage가 직접 호출하는 redirect (handleProgressComplete)
  //   - HOME: 이탈방지 팝업에서 '나가기'를 선택하면 이동하는 destination, invalid 가드 fallback
  //   - LOGIN: 세션 만료(SESSION_EXPIRED) 시 globalErrorHandler가 강제 redirect — 모달로 막으면 재인증 불가하므로 통과
  useExitBlocker({
    enabled: true,
    shouldBlockNavigation: ({ nextLocation }) => {
      if (
        nextLocation.pathname === ROUTES.GENERATE_RESULT ||
        nextLocation.pathname === ROUTES.HOME ||
        nextLocation.pathname === ROUTES.LOGIN
      ) {
        return false;
      }
      return true;
    },
    onBlocked: ({ reset, historyAction }) => {
      if (historyAction === 'POP') {
        trackLoadImgPageBackSwipe();
      }
      trackLoadImgMdGenImgQuitView();

      overlay.open(({ unmount }) => {
        // '계속 기다리기' / backdrop 클릭 -> blocker 'blocked' 상태 해제, LoadingPage에 머무름
        const stay = () => {
          reset();
          unmount();
        };
        const exit = () => {
          trackGenImgQuitMdQuitClick(SCREEN_NAME.LOAD_IMG);
          unmount();
          exitImageFlow();
          reset();
          navigate(ROUTES.HOME, { replace: true });
        };

        return (
          <Popup
            btnStyle="text"
            btnText="생성 기다리기"
            weakBtnText="나가기"
            topIconName="WarningFillDanger"
            onClose={() => {
              trackGenImgQuitMdKeepClick();
              stay();
            }}
            onConfirm={() => {
              trackGenImgQuitMdKeepClick();
              stay();
            }}
            onCancel={exit}
            content={
              <div className={styles.popupContent}>
                <h3 className={styles.popupTitle}>
                  잠깐! 지금 나가면
                  <br />
                  이미지 생성이 중단돼요.
                </h3>
                <p className={styles.popupDetail}>
                  조금만 더 기다리면 내 취향에 딱 맞는
                  <br />
                  공간을 확인할 수 있어요.
                </p>
              </div>
            }
          />
        );
      });
    },
  });

  // LoadingPage 진입 시 이전 이미지 생성 상태 초기화 (이미지 재생성 시 이전 이미지를 보여주는 버그 방지)
  // useRef로 첫 렌더링 시 동기적으로 실행 -> ProgressBar보다 먼저 초기화
  const hasResetRef = useRef(false);
  if (!hasResetRef.current) {
    resetGenerate();
    hasResetRef.current = true;
  }

  // 진입경로(useImageFlowStore.preset)에 따라 적합한 mutation + payload 결정
  // - 풀퍼널: useFunnelStore 데이터로 풀퍼널 이미지 생성 payload 조립
  // - 숏퍼널: 프리셋 데이터(useImageFlowStore.preset) + 퍼널의 도면 데이터(useFunnelStore.floorPlan)로 배너/다른 스타일로 이미지 생성 payload 조립
  const requestState = useGenerateImageRequest();

  // 이미지 생성 payload에 필요한 데이터가 정상적으로 구성되어 있으면 true
  const isRequestValid = requestState.kind !== 'invalid';

  useAnalyticsPageView(
    GA_EVENTS.loadImg.PAGE_VIEW,
    SCREEN_NAME.LOAD_IMG,
    {
      ...loginStatusParams(),
      image_entry_route: getEntryRoute(),
      return_screen_name: getLoadImgReturnScreenName(),
    },
    { enabled: isRequestValid }
  );

  const hasTrackedPageRefreshRef = useRef(false);

  useEffect(() => {
    if (hasTrackedPageRefreshRef.current) return;
    if (!isDocumentReloadOnPath(ROUTES.GENERATE)) return;

    hasTrackedPageRefreshRef.current = true;
    trackLoadImgPageRefresh();
  }, []);

  const viewedProductIdsRef = useRef<Set<number>>(new Set());

  const [currentIndex, setCurrentIndex] = useState(0);

  // 캐러셀 애니메이션 상태 - 스택 UI
  const [animating, setAnimating] = useState(false);
  const [frontSlot, setFrontSlot] = useState<'A' | 'B'>('A');
  const [slotAImage, setSlotAImage] = useState<GetCarouselResponseDTO | null>(
    null
  );
  const [slotBImage, setSlotBImage] = useState<GetCarouselResponseDTO | null>(
    null
  );

  // 애니메이션 타이머 정리용 ref
  const transitionTimeoutRef = useRef<number | null>(null);

  const {
    data: currentStack,
    isPending,
    isError,
  } = useStackDataQuery(isRequestValid);

  const currentImages = currentStack?.carousels ?? [];

  // 스택 UI 좋아요 (찜하기 연동됨)
  const { mutate: postLike, isPending: isJjymLoading } =
    usePostCarouselLikeMutation();

  const notifyImageGenerationError = useCallback(() => {
    notify({
      text: TOAST_MESSAGE.IMAGE_GENERATION_SERVER_ERROR,
      type: TOAST_TYPE.ERROR,
      hasIcon: false,
      options: { toasterId: TOASTER_ID.TOP_4 },
    });
  }, [notify]);

  const notifyActionServerError = useCallback(() => {
    notify({
      text: TOAST_MESSAGE.ACTION_SERVER_ERROR,
      type: TOAST_TYPE.ERROR,
      options: { toasterId: TOASTER_ID.BOTTOM_4 },
    });
  }, [notify]);

  const recoverFromImageGenerationError = useCallback(() => {
    exitImageFlow();
    navigate(ROUTES.HOME, { replace: true });
  }, [exitImageFlow, navigate]);

  // 진입경로별 mutation 호출 (풀퍼널 / banner / otherStyle / product 분기)
  useEffect(() => {
    const onMutationError = (error: unknown) => {
      if (isImageGenerationServerError(error)) {
        notifyImageGenerationError();
      } else {
        notifyActionServerError();
      }

      recoverFromImageGenerationError();
    };

    // 요청이 끝나면(성공/실패 모두) 쓴 데이터를 정리한다.
    // (안 그러면 /generate로 다시 들어왔을 때 같은 요청이 또 나감. 세부 정리는 completeGenerationRequest 참고)
    const onMutationSettled = () => {
      useImageFlowStore.getState().completeGenerationRequest();
    };

    const mutateOptions = {
      onError: onMutationError,
      onSettled: onMutationSettled,
    };

    if (requestState.kind === 'invalid') {
      console.error('invalid requestState kind');
      return;
    }

    ensureShortFunnelFlowSnapshot();

    switch (requestState.kind) {
      case 'fullFunnel':
        requestState.mutate(requestState.payload, mutateOptions);
        return;
      case 'banner':
        requestState.mutate(requestState.payload, mutateOptions);
        return;
      case 'otherStyle':
        requestState.mutate(requestState.payload, mutateOptions);
        return;
      case 'product':
        requestState.mutate(requestState.payload, mutateOptions);
        return;
    }
  }, [
    notifyActionServerError,
    notifyImageGenerationError,
    recoverFromImageGenerationError,
    requestState,
  ]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // currentImages는 `currentStack?.carousels ?? []`로 항상 배열 → 빈 배열 여부만 확인
  const hasError = isError || currentImages.length === 0;

  // 정상 데이터일 때 현재/다음 이미지 계산
  const currentImage = hasError ? null : currentImages[currentIndex];

  const nextImage = hasError
    ? null
    : currentImages.length > 1
      ? currentImages[currentIndex + 1]
      : undefined;

  useEffect(() => {
    if (animating) return;
    if (frontSlot === 'A') {
      setSlotAImage(currentImage);
      setSlotBImage(nextImage ?? null);
      return;
    }

    setSlotBImage(currentImage);
    setSlotAImage(nextImage ?? null);
  }, [animating, currentImage, nextImage, frontSlot]);

  const displayCurrentImage = frontSlot === 'A' ? slotAImage : slotBImage;
  const displayNextImage = frontSlot === 'A' ? slotBImage : slotAImage;

  useEffect(() => {
    if (isPending || hasError || displayCurrentImage?.rawProductId == null) {
      return;
    }

    const productId = displayCurrentImage.rawProductId;
    if (viewedProductIdsRef.current.has(productId)) return;

    viewedProductIdsRef.current.add(productId);
    trackLoadImgCardPreferenceView({
      productId,
      loadedProductIds: Array.from(viewedProductIdsRef.current).join(', '),
    });
  }, [displayCurrentImage, hasError, isPending]);

  const handleProgressComplete = () => {
    if (!navigationData || !isApiCompleted) return;
    const { imageId, imageUrl, isMirror } = navigationData;
    // 결과 화면 종류(STYLE/PRODUCT/BANNER/FULL_FUNNEL)를 flow에서 계산.
    // flow가 없으면 null → ResultPage가 기본(추천형) 화면으로 보여준다.
    const flow = useImageFlowStore.getState().flow;
    const viewType = flow ? FLOW_CONFIG[flow.route].resultView : null;

    // url에 imageId/viewType, state에 imageUrl/isMirror 전달
    // state.from='loading': ResultPage가 진입 경로를 식별해 뒤로가기 가드를 다르게 적용
    // (loading 경유: 뒤로가기 시 HOME으로 강제 redirect / 마이페이지 경유: 일반 history(-1))
    navigate(
      `${ROUTES.GENERATE_RESULT}?houseId=${imageId}&viewType=${viewType}`,
      {
        replace: true,
        state: { imageUrl, isMirror, from: 'loading', entryGenImgId: imageId },
      }
    );
  };

  const closeTooltip = () => {
    setIsTooltipOpen(false);
  };

  // 좋아요/별로예요 버튼 클릭 핸들러
  const handleAction = (isLike: boolean) => {
    // 로딩 중 or 투표 중에는 투표(vote) 불가
    if (isPending || isJjymLoading) return;
    if (!displayCurrentImage) return;

    const productId = displayCurrentImage.rawProductId;
    if (productId == null) return;

    setIsTooltipOpen(false);

    trackLoadImgCardPreferenceClick({
      productId,
      isLike,
    });

    if (isLike) {
      if (displayCurrentImage?.rawProductId == null) return;
      postLike(displayCurrentImage.rawProductId, {
        onSuccess: () => {
          goToNext();
        },
      });
    } else {
      goToNext();
    }
  };

  // 다음 이미지로 전환
  const goToNext = () => {
    if (animating) return;
    if (!displayNextImage) return;

    setAnimating(true);

    // 기존 타이머 정리
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    // 600ms 후 다음 이미지로 전환
    transitionTimeoutRef.current = window.setTimeout(() => {
      setFrontSlot((prev) => (prev === 'A' ? 'B' : 'A'));

      if (currentImages.length > 1) {
        setCurrentIndex((prev) => prev + 1);
      }

      setAnimating(false);
      transitionTimeoutRef.current = null;
    }, ANIMATION_DURATION);
  };

  const slotAClassName =
    frontSlot === 'A'
      ? `${styles.currentImageArea} ${animating ? styles.currentImageAreaOut : ''}`
      : `${styles.nextImageArea} ${animating ? styles.nextImageAreaActive : ''}`;

  const slotBClassName =
    frontSlot === 'B'
      ? `${styles.currentImageArea} ${animating ? styles.currentImageAreaOut : ''}`
      : `${styles.nextImageArea} ${animating ? styles.nextImageAreaActive : ''}`;

  // early return
  // store에서 payload 조립 실패 시(직접 URL 접근, 데이터 손실 등) HOME으로 리다이렉트
  // (ImageSetupPage의 entryRoute 가드와 동일하게 HOME fallback)
  if (requestState.kind === 'invalid') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <main className={styles.pageLayout}>
      <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
        {isPending ? (
          <Loading />
        ) : (
          <div className={styles.wrapper}>
            <ProgressBar onComplete={handleProgressComplete} />

            <section className={styles.carouselSection}>
              <div className={styles.imageContainer}>
                {hasError ? (
                  <div className={styles.currentImageArea}>
                    {/* 임시로 에러일 때 이미지 */}
                    <img
                      src={TestImg}
                      alt="기본 가구 이미지"
                      className={styles.imageStyle}
                    />
                  </div>
                ) : (
                  <>
                    {slotAImage?.url && (
                      <div className={slotAClassName}>
                        <OptimizedImage
                          src={slotAImage.url}
                          alt={
                            frontSlot === 'A'
                              ? `현재 가구 이미지`
                              : `다음 가구 이미지`
                          }
                          className={styles.imageStyle}
                          placeholder="color"
                          loading="eager"
                        />
                      </div>
                    )}

                    {slotBImage?.url && (
                      <div className={slotBClassName}>
                        <OptimizedImage
                          src={slotBImage.url}
                          alt={
                            frontSlot === 'B'
                              ? `현재 가구 이미지`
                              : `다음 가구 이미지`
                          }
                          className={styles.imageStyle}
                          placeholder="color"
                          loading="eager"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {!hasError && displayCurrentImage && (
              <div className={styles.buttonGroup}>
                <LikeButton
                  name="dislike"
                  onClick={() => handleAction(false)}
                />
                <Tooltip
                  content="마음에 드는 상품을 선택하면 찜한 상품에 추가돼요!"
                  isOpen={isTooltipOpen}
                  onClose={closeTooltip}
                >
                  <LikeButton name="like" onClick={() => handleAction(true)} />
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </ErrorBoundary>
    </main>
  );
};

export default LoadingPage;
