import { useEffect, useMemo, useRef, useState } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import DislikeButton from '@/shared/components/button/likeButton/DislikeButton';
import LikeButton from '@/shared/components/button/likeButton/LikeButton';
import Loading from '@/shared/components/loading/Loading';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

import {
  useStackData,
  usePostCarouselLikeMutation,
  usePostCarouselHateMutation,
  useGenerateImageApi,
  useFallbackImage,
} from '@pages/generate/hooks/useGenerate';
import { useGenerateStore } from '@pages/generate/stores/useGenerateStore';

import * as styles from './LoadingPage.css';
import ProgressBar from './ProgressBar';

import type { GenerateImageRequest } from '@pages/generate/types/generate';

const ANIMATION_DURATION = 600; // 캐러셀 애니메이션 지속 시간 (ms)
const SESSION_STORAGE_KEY = 'generate_image_request'; // sessionStorage 키

// Type Guard: GenerateImageRequest 검증
// sessionStorage에서 가져온 데이터 검증
const isValidGenerateImageRequest = (
  value: unknown
): value is GenerateImageRequest => {
  if (!value || typeof value !== 'object') return false;

  const request = value as Record<string, unknown>;
  const floorPlan = request.floorPlan as Record<string, unknown> | undefined;

  return (
    typeof request.houseId === 'number' &&
    typeof request.equilibrium === 'string' &&
    typeof request.activity === 'string' &&
    Array.isArray(request.moodBoardIds) &&
    (request.moodBoardIds as unknown[]).every((n) => typeof n === 'number') &&
    Array.isArray(request.selectiveIds) &&
    (request.selectiveIds as unknown[]).every((n) => typeof n === 'number') &&
    floorPlan !== undefined &&
    typeof floorPlan === 'object' &&
    typeof floorPlan.floorPlanId === 'number' &&
    typeof floorPlan.isMirror === 'boolean'
  );
};

// TODO: 커스텀 훅, 유틸함수로 빼기, 기능 별 커스텀 훅 분할 시급
const LoadingPage = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler('generate');

  // Zustand store: 이미지 생성 완료 상태 및 결과 데이터
  const { isApiCompleted, navigationData, resetGenerate } = useGenerateStore();

  // LoadingPage 진입 시 이전 이미지 생성 상태 초기화 (이미지 재생성 시 이전 이미지를 보여주는 버그 방지)
  // useRef로 첫 렌더링 시 동기적으로 실행 -> ProgressBar보다 먼저 초기화
  const hasResetRef = useRef(false);
  if (!hasResetRef.current) {
    resetGenerate();
    hasResetRef.current = true;
  }

  // sessionStorage에서 이미지 생성 요청 데이터 가져오기
  const requestData: GenerateImageRequest | null = useMemo(() => {
    // useMemo로 파싱 결과 참조 고정해 렌더 시 불필요한 API 재호출 차단
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return isValidGenerateImageRequest(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  // 정상 진입 여부, true: 일반 이미지 생성 API 호출, false: 폴백 이미지 API 호출
  const [isNormalEntry, setIsNormalEntry] = useState(true);

  // 일반 이미지 생성 API(A/B 테스트 분류에 따라 이미지 1장/2장 생성)
  const { mutate: mutateGenerateImage } = useGenerateImageApi();

  // 폴백 이미지 생성 API (일반 API 실패 시 사용)
  // isNormalEntry가 변경되면 컴포넌트 리렌더링 -> useFallbackImage 실행 -> useQuery가 enabled값 감지
  // -> true: 폴백 API 요청, false: 쿼리 실행 X
  useFallbackImage(requestData?.houseId || 0, !isNormalEntry, (error) => {
    handleError(error, 'loading');
  });

  // 캐러셀 페이지네이션 (무한 스크롤) - 스택 UI
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 스택 UI 투표 중 상태
  const [isVoting, setIsVoting] = useState(false);

  // 캐러셀 애니메이션 상태 - 스택 UI
  const [animating, setAnimating] = useState(false);
  const [selected, setSelected] = useState<'like' | 'dislike' | null>(null);

  // 애니메이션 타이머 정리용 ref
  const transitionTimeoutRef = useRef<number | null>(null);

  const {
    data: currentImages,
    isLoading,
    isError,
  } = useStackData(currentPage, {
    enabled: !!requestData, // requestData가 있을 때만 활성화
    onSuccess: () => setCurrentIndex(0), // 새 페이지 로드 시 첫 이미지부터 시작
    onError: (err) => handleError(err, 'loading'),
  });

  const { data: nextImages } = useStackData(currentPage + 1, {
    enabled: !!currentImages && !!requestData,
  });

  const likeMutation = usePostCarouselLikeMutation();
  const hateMutation = usePostCarouselHateMutation();

  useEffect(() => {
    if (!requestData) return;

    mutateGenerateImage(requestData, {
      onSuccess: () => {
        // 성공 시 navigationData 설정, 프로그래스 바 완료 후 페이지 이동
      },
      onError: (error: any) => {
        const errorCode = error?.response?.data?.code;
        const errorStatus = error?.response?.status;

        // 429 에러 또는 42900/42901 코드: 폴백 API로 전환
        // 40900: 새로고침 후 일반 이미지 요청 API 요청 시 반환되는 에러코드
        if (
          errorStatus === 429 ||
          errorCode === 42900 ||
          errorCode === 42901 ||
          errorCode === 40900
        ) {
          setIsNormalEntry(false); // 폴백 API 활성화
        }
        // 기타 에러: 일반 에러 처리
        else {
          console.error('이미지 생성 실패:', error);
          handleError(error, 'loading');
        }
      },
    });
  }, [handleError, mutateGenerateImage, requestData]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const hasError =
    isError ||
    (!isLoading && !currentImages) ||
    !currentImages ||
    currentImages.length === 0;

  // 정상 데이터(normal data)일 때 현재/다음 이미지 계산
  const currentImage = hasError ? null : currentImages[currentIndex];

  const isLast = hasError ? false : currentIndex === currentImages.length - 1;

  const nextImage = hasError
    ? null
    : !isLast
      ? currentImages[currentIndex + 1]
      : nextImages && nextImages.length > 0
        ? nextImages[0]
        : undefined;

  const handleProgressComplete = () => {
    if (navigationData && isApiCompleted) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      navigate(ROUTES.GENERATE_RESULT, {
        state: {
          result: navigationData,
        },
        replace: true,
      });
    }
  };

  const handleVote = (isLike: boolean) => {
    // 로딩 중 or 투표 중에는 투표(vote) 불가
    if (isLoading || isVoting) return;

    if (!currentImage) return;
    setIsVoting(true);

    // 선택 상태 업데이트 (버튼 하이라이트)
    setSelected(isLike ? 'like' : 'dislike');

    // API 호출: 좋아요/별로예요 전송
    const mutation = isLike ? likeMutation.mutate : hateMutation.mutate;

    mutation(currentImage.carouselId, {
      onSuccess: () => {
        setAnimating(true);

        // 기존 타이머 정리
        if (transitionTimeoutRef.current !== null) {
          window.clearTimeout(transitionTimeoutRef.current);
        }

        // 600ms 후 다음 이미지로 전환
        transitionTimeoutRef.current = window.setTimeout(() => {
          // 현재 페이지에 다음 이미지가 있으면 인덱스 증가
          if (!isLast) {
            setSelected(null);
            setCurrentIndex((prev) => prev + 1);
          }
          // 마지막 이미지면 다음 페이지로 이동
          else {
            if (nextImages && nextImages.length > 0) {
              setSelected(null);
              setCurrentPage((prev) => prev + 1);
              setCurrentIndex(0);
            } else {
              // console.log('마지막 페이지 도달');
            }
          }

          setAnimating(false);
          setIsVoting(false);
          transitionTimeoutRef.current = null;
        }, ANIMATION_DURATION);
      },
      onError: () => {
        alert(isLike ? '좋아요 실패' : '싫어요 실패');
        setSelected(null);
        setIsVoting(false);
      },
    });
  };

  // early return
  // requestData가 없으면 IMAGE_SETUP으로 리다이렉트
  if (!requestData) {
    return <Navigate to={ROUTES.IMAGE_SETUP} replace />;
  }

  // 로딩 스피너
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.infoSection}>
        <ProgressBar onComplete={handleProgressComplete} />
        <p className={styles.infoText}>
          마음에 드는 가구를 선택하면, <br />
          하우미가 사용자님의 취향을 더 잘 이해할 수 있어요!
        </p>
      </section>

      <section className={styles.carouselSection}>
        <div className={styles.imageContainer}>
          {hasError ? (
            // 에러 상황: 에러 메시지 표시
            <div className={styles.errorMessage}>
              <p>이미지를 불러올 수 없습니다</p>
            </div>
          ) : (
            // 정상 상황: 이미지 캐러셀 표시
            <>
              {nextImage && (
                <div
                  key={`next-${currentPage + 1}-${nextImage.carouselId}`}
                  className={`${styles.nextImageArea} ${
                    animating ? styles.nextImageAreaActive : ''
                  }`}
                >
                  <img
                    src={nextImage.url}
                    alt={`다음 가구 이미지 ${nextImage.carouselId}`}
                    className={styles.imageStyle}
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {currentImage && (
                <div
                  key={`current-${currentPage}-${currentImage.carouselId}`}
                  className={`${styles.currentImageArea} ${
                    animating ? styles.currentImageAreaOut : ''
                  }`}
                >
                  <img
                    src={currentImage.url}
                    alt={`현재 가구 이미지 ${currentImage.carouselId}`}
                    className={styles.imageStyle}
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {!hasError && (
          <div className={styles.buttonGroup}>
            <LikeButton
              onClick={() => handleVote(true)}
              isSelected={selected === 'like'}
              disabled={isVoting || animating}
            >
              좋아요
            </LikeButton>
            <DislikeButton
              onClick={() => handleVote(false)}
              isSelected={selected === 'dislike'}
              disabled={isVoting || animating}
            >
              별로예요
            </DislikeButton>
          </div>
        )}
      </section>
    </div>
  );
};

export default LoadingPage;
