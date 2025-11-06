import { useEffect, useRef, useState } from 'react';

import { Navigate, useLocation, useNavigate } from 'react-router-dom';

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
  useGenerateImageStatusCheck,
} from '@pages/generate/hooks/useGenerate';
import { useGenerateStore } from '@pages/generate/stores/useGenerateStore';

import * as styles from './LoadingPage.css';
import ProgressBar from './ProgressBar';

import type { GenerateImageRequest } from '@pages/generate/types/generate';

const ANIMATION_DURATION = 600; // 캐러셀 애니메이션 지속 시간 (ms)

// LoadingPage의 location.state 타입
// ActivityInfo에서 navigate로 전달되는 이미지 생성 요청 데이터
type PageState = {
  generateImageRequest: GenerateImageRequest;
};

// Type Guard: location.state 검증
// ActivityInfo에서 전달된 이미지 생성 요청 데이터가 유효한지 확인
// TODO: Zod로 PageState 타입 검증 로직 구현(타입 하드코딩 제거, 타입 변경 시 검증 로직 자동 업데이트, 코드 더 짧고 직관적)
const isValidPageState = (value: unknown): value is PageState => {
  if (!value || typeof value !== 'object') return false;

  const { generateImageRequest } = value as Record<string, unknown>;
  if (!generateImageRequest || typeof generateImageRequest !== 'object') {
    return false;
  }

  const request = generateImageRequest as Record<string, unknown>;
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

/**
 * LoadingPage: 이미지 생성 대기 페이지
 *
 * 사용자가 ActivityInfo에서 "완료" 버튼을 누른 후 이동하는 페이지
 *
 * 주요 기능:
 * 1. 이미지 생성 요청: ActivityInfo에서 전달받은 데이터로 AI 이미지 생성 API 호출
 *    - A/B 테스트에 따라 POST /api/v3 (다중 이미지) 또는 POST /api/v2 (단일 이미지) 사용
 *
 * 2. 가구 캐러셀: 이미지 생성 대기 중(약 30초) 사용자에게 가구 선호도 수집
 *    - 좋아요/별로예요 선택으로 사용자 취향 파악
 *    - 무한 스크롤 방식으로 여러 페이지의 가구 이미지 제공
 *
 * 3. 프로그래스 바: 이미지 생성 진행 상황 표시
 *    - 완료 시 자동으로 결과 페이지로 이동
 *
 * 4. 폴백 처리: 에러 발생 시 또는 새로고침 시 대체 API로 전환
 *    - 429 에러 (Too Many Requests) 발생 시
 *    - 42900/42901 에러 (서버 가용 한계치 초과) 발생 시
 *    - GET /api/v1/generated-images/generate로 이미지 생성 상태 폴링
 */
const LoadingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler('generate');

  // Zustand store: 이미지 생성 완료 상태 및 결과 데이터
  const { isApiCompleted, navigationData } = useGenerateStore();

  // 정상 진입 여부, true: 일반 이미지 생성 API 호출, false: 폴백 이미지 API 호출
  const [isNormalEntry, setIsNormalEntry] = useState(true);

  // useLocation()의 location.state에서 가져온 raw data(unknown 타입)
  const rawState = location.state;

  // 이미지 생성 요청 데이터 추출
  // rawState의 타입이 이미지 생성 요청 request body에 적절한 타입인지 확인, 적절하면 값 추출, 틀리면 null 할당
  const requestData: GenerateImageRequest | null = isValidPageState(rawState)
    ? rawState.generateImageRequest
    : null;

  // 일반 이미지 생성 API(A/B 테스트 분류에 따라 이미지 1장/2장 생성)
  const { mutate: mutateGenerateImage } = useGenerateImageApi();

  useGenerateImageStatusCheck(requestData?.houseId || 0, !isNormalEntry);

  // 캐러셀 페이지네이션 (무한 스크롤)
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 캐러셀 애니메이션 상태
  const [animating, setAnimating] = useState(false);
  const [selected, setSelected] = useState<'like' | 'dislike' | null>(null);

  // 애니메이션 타이머 정리용 ref
  const transitionTimeoutRef = useRef<number | null>(null);

  // ============================================================================
  // Carousel Data Fetching
  // ============================================================================

  /**
   * useStackData: 가구 캐러셀 이미지 데이터 페칭
   * - currentPage에 해당하는 가구 이미지 목록 가져오기
   * - 페이지 변경 시 currentIndex를 0으로 초기화
   */
  const {
    data: currentImages,
    isLoading,
    isError,
  } = useStackData(currentPage, {
    enabled: !!requestData, // requestData가 있을 때만 활성화
    onSuccess: () => setCurrentIndex(0), // 새 페이지 로드 시 첫 이미지부터 시작
    onError: (err) => handleError(err, 'loading'),
  });

  /**
   * 다음 페이지 프리페치 (성능 최적화)
   * - 사용자가 현재 페이지를 보는 동안 다음 페이지 미리 로드
   * - 마지막 이미지에서 자연스러운 전환 제공
   */
  const { data: nextImages } = useStackData(currentPage + 1, {
    enabled: !!currentImages && !!requestData,
  });

  const likeMutation = usePostCarouselLikeMutation();
  const hateMutation = usePostCarouselHateMutation();

  /**
   * 정상 이미지 생성 API 호출
   * - ActivityInfo에서 전달받은 requestData로 이미지 생성 요청
   * - A/B 테스트에 따라 단일/다중 이미지 생성 API 선택
   *
   * 성공 시:
   * - Zustand store에 결과 저장 (useGenerateImageApi 내부)
   * - 프로그래스 바 완료 후 결과 페이지로 이동
   *
   * 실패 시 (429/42900/42901):
   * - isNormalEntry=false로 설정하여 폴백 API로 전환
   * - 7초마다 이미지 생성 상태 확인 (GET /api/v1)
   */
  useEffect(() => {
    if (!requestData) return;

    console.log('✅ 이미지 생성 요청 시작:', requestData);

    mutateGenerateImage(requestData, {
      onSuccess: () => {
        console.log('✅ 이미지 생성 성공');
        // 성공 시에는 isNormalEntry 변경 불필요
        // navigationData 설정되고 프로그래스 바 완료 후 페이지 이동
      },
      onError: (error: any) => {
        const errorCode = error?.response?.data?.code;
        const errorStatus = error?.response?.status;

        // 429 에러 또는 42900/42901 코드: 폴백 API로 전환
        if (errorStatus === 429 || errorCode === 42900 || errorCode === 42901) {
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
  }, [mutateGenerateImage, requestData, handleError]);

  /**
   * 컴포넌트 언마운트 시 타이머 정리
   * - 메모리 누수 방지
   */
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // early return
  // requestData가 없으면 IMAGE_SETUP으로 리다이렉트
  if (!requestData) {
    return <Navigate to={ROUTES.IMAGE_SETUP} replace />;
  }

  // 초기 로딩 중
  if (isLoading) {
    return <Loading />;
  }

  // ============================================================================
  // Computed Values: 캐러셀 상태
  // ============================================================================

  /**
   * 에러 상황 체크
   * - API 에러 또는 데이터 없음
   */
  const hasError =
    isError ||
    (!isLoading && !currentImages) ||
    !currentImages ||
    currentImages.length === 0;

  /**
   * 현재 표시할 이미지 정보
   * - hasError일 때는 null
   * - 정상일 때는 currentImages[currentIndex]
   */
  const currentImage = hasError ? null : currentImages[currentIndex];

  /**
   * 현재 이미지가 페이지의 마지막인지 여부
   */
  const isLast = hasError ? false : currentIndex === currentImages.length - 1;

  /**
   * 다음에 표시할 이미지
   * - 현재 페이지에 다음 이미지가 있으면 그것 사용
   * - 마지막 이미지면 다음 페이지의 첫 이미지 사용
   */
  const nextImage = hasError
    ? null
    : !isLast
      ? currentImages[currentIndex + 1]
      : nextImages && nextImages.length > 0
        ? nextImages[0]
        : undefined;

  // ============================================================================
  // Event Handlers: 프로그래스 바 완료 (페이지 이동)
  // ============================================================================

  /**
   * 프로그래스 바 완료 시 결과 페이지로 이동
   * - navigationData: 생성된 이미지 정보 (Zustand store에서 관리)
   * - isApiCompleted: API 완료 플래그
   *
   * ProgressBar 컴포넌트에서 100% 도달 시 onComplete 콜백 호출
   */
  const handleProgressComplete = () => {
    if (navigationData && isApiCompleted) {
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

  // ============================================================================
  // Event Handlers: 캐러셀 투표 (좋아요/별로예요)
  // ============================================================================

  /**
   * 가구 이미지 투표 처리
   *
   * @param isLike - true: 좋아요, false: 별로예요
   *
   * 동작 순서:
   * 1. 선택 상태 업데이트 (버튼 애니메이션)
   * 2. API 호출 (좋아요/별로예요 전송)
   * 3. 600ms 후 다음 이미지로 전환
   * 4. 마지막 이미지면 다음 페이지로 이동
   */
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={styles.wrapper}>
      {/* ========== 상단: 프로그래스 바 및 안내 메시지 ========== */}
      <section className={styles.infoSection}>
        <ProgressBar onComplete={handleProgressComplete} />
        <p className={styles.infoText}>
          마음에 드는 가구를 선택하면, <br />
          하우미가 사용자님의 취향을 더 잘 이해할 수 있어요!
        </p>
      </section>

      {/* ========== 하단: 캐러셀 이미지 및 투표 버튼 ========== */}
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
              {/* 다음 이미지 (애니메이션 준비) */}
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

              {/* 현재 이미지 */}
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

        {/* 투표 버튼 (에러 상황에서는 숨김) */}
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
