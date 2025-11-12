import { useEffect, useRef, useState } from 'react';

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

// LoadingPage의 location.state 타입
// ActivityInfo에서 navigate로 전달되는 이미지 생성 요청 데이터
type PageState = {
  generateImageRequest: GenerateImageRequest;
};

// Type Guard: GenerateImageRequest 검증
// sessionStorage에서 가져온 데이터가 유효한지 확인
// TODO: Zod로 타입 검증 로직 구현(타입 하드코딩 제거, 타입 변경 시 검증 로직 자동 업데이트, 코드 더 짧고 직관적)
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

const LoadingPage = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler('generate');

  // Zustand store: 이미지 생성 완료 상태 및 결과 데이터
  const { isApiCompleted, navigationData } = useGenerateStore();

  // sessionStorage에서 이미지 생성 요청 데이터 가져오기
  const requestData: GenerateImageRequest | null = (() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      console.warn('sessionStorage에 저장된 데이터 없음');
      return null;
    }
    try {
      const parsed = JSON.parse(stored);
      if (isValidGenerateImageRequest(parsed)) {
        console.log('🔥 sessionStorage의 requestData 복원: 🔥', parsed);
        return parsed;
      } else {
        console.error('sessionStorage 데이터가 유효하지 않음');
        return null;
      }
    } catch (error) {
      console.error('essionStorage 파싱 실패:', error);
      return null;
    }
  })();

  // 정상 진입 여부, true: 일반 이미지 생성 API 호출, false: 폴백 이미지 API 호출
  const [isNormalEntry, setIsNormalEntry] = useState(true);

  // 일반 이미지 생성 API(A/B 테스트 분류에 따라 이미지 1장/2장 생성)
  const { mutate: mutateGenerateImage } = useGenerateImageApi();

  // 폴백 이미지 생성 API (일반 API 실패 시 사용)
  // isNormalEntry가 변경되면 컴포넌트 리렌더링 -> useFallbackImage 호출 -> useQuery가 enabled값 감지 -> true:API요청, false:대기
  // 계속 true일 시 refetchInterval마다 자동 polling
  console.log('isNormalEntry: ', isNormalEntry);
  useFallbackImage(requestData?.houseId || 0, !isNormalEntry);

  // 캐러셀 페이지네이션 (무한 스크롤)
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 캐러셀 애니메이션 상태
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
    if (!requestData) {
      console.log('!request === true');
      return;
    }

    console.log('✅ 이미지 생성 요청 시작 ✅:', requestData);
    console.log('isNormalEntry: ', isNormalEntry);

    mutateGenerateImage(requestData, {
      onSuccess: () => {
        console.log('🫡 이미지 생성 성공 🫡');
        // 성공 시에는 isNormalEntry 변경 불필요
        // navigationData 설정되고 프로그래스 바 완료 후 페이지 이동
      },
      onError: (error: any) => {
        const errorCode = error?.response?.data?.code;
        const errorStatus = error?.response?.status;

        console.log('❗️❗️ onError 진입 ❗️❗️');
        console.log('errorCode: ', errorCode);
        console.log('errorStatus: ', errorStatus);

        // 429 에러 또는 42900/42901 코드: 폴백 API로 전환
        if (
          errorStatus === 429 ||
          errorCode === 42900 ||
          errorCode === 42901 ||
          errorCode === 40900
        ) {
          console.log('🚨 에러 발생 → 폴백 API로 전환:', {
            errorStatus,
            errorCode,
          });
          setIsNormalEntry(false); // 폴백 API 활성화
        }
        // 기타 에러: 일반 에러 처리
        else {
          console.error('❌ 이미지 생성 실패:', error);
          handleError(error, 'loading');
        }
      },
    });
  }, []);

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
      // sessionStorage 정리
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      console.log('🗑️ sessionStorage 정리 완료');

      console.log(
        '🎯 프로그래스 바 완료 → 결과 페이지 이동:',
        new Date().toLocaleTimeString()
      );
      navigate(ROUTES.GENERATE_RESULT, {
        state: {
          result: navigationData,
        },
        replace: true,
      });
    }
  };

  const handleVote = (isLike: boolean) => {
    // 로딩 중에는 투표 불가
    if (isLoading) return;

    // 선택 상태 업데이트 (버튼 하이라이트)
    setSelected(isLike ? 'like' : 'dislike');
    setAnimating(true);

    // API 호출: 좋아요/별로예요 전송
    if (isLike && currentImage) {
      likeMutation.mutate(currentImage.carouselId, {
        onError: () => {
          alert('좋아요 실패');
        },
      });
    } else if (!isLike && currentImage) {
      hateMutation.mutate(currentImage.carouselId, {
        onError: () => {
          alert('싫어요 실패');
        },
      });
    }

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
          console.log('마지막 페이지 도달');
        }
      }

      setAnimating(false);
      transitionTimeoutRef.current = null;
    }, ANIMATION_DURATION);
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
            >
              좋아요
            </LikeButton>
            <DislikeButton
              onClick={() => handleVote(false)}
              isSelected={selected === 'dislike'}
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
