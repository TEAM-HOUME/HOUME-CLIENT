import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as styles from './LoadingPage.css';
import ProgressBar from './ProgressBar';
import {
  useStackData,
  useLikeStackMutation,
  useHateStackMutation,
  useGenerateImageApi,
} from '../../hooks/useGenerate';
import type { GenerateImageRequest } from '../../types/GenerateType';
import LikeButton from '@/shared/components/button/likeButton/LikeButton';
import DislikeButton from '@/shared/components/button/likeButton/DislikeButton';
import { ROUTES } from '@/routes/paths';
import Loading from '@/shared/components/loading/Loading';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

const LoadingPage = () => {
  // 이미지 생성 api 코드 ...
  const location = useLocation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler('generate');

  // TODO: location.state의 타입 검증 로직 개선 필요(런타임 오류 방지)
  const requestData: GenerateImageRequest | null =
    (location.state as { generateImageRequest?: GenerateImageRequest })
      ?.generateImageRequest || null;
  const generateImageRequest = useGenerateImageApi();

  useEffect(() => {
    if (requestData) {
      console.log('이미지 생성 요청 시작:', requestData);

      generateImageRequest.mutate(requestData);
    } else {
      console.log('requestData is null, redirect to /onboarding');
      navigate(ROUTES.ONBOARDING);
    }
  }, [requestData, generateImageRequest, navigate]);
  // ... 이미지 생성 api 코드 끝

  const [currentPage, setCurrentPage] = useState(0);
  const {
    data: currentImages,
    isLoading,
    isError,
    error,
  } = useStackData(currentPage, { enabled: true });
  const { data: nextImages } = useStackData(currentPage + 1, {
    enabled: !!currentImages, // next prefetch
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selected, setSelected] = useState<'like' | 'dislike' | null>(null);
  const ANIMATION_DURATION = 600;

  const likeMutation = useLikeStackMutation();
  const hateMutation = useHateStackMutation();

  useEffect(() => {
    setCurrentIndex(0);
  }, [currentImages]);

  useEffect(() => {
    if (isError || !currentImages) {
      handleError(error || new Error('Stack data load failed'), 'loading');
    }
  }, [isError, currentImages, error, handleError]);

  if (isLoading) return <Loading text="로딩중" />;

  if (isError || !currentImages) {
    return null;
  }

  const currentImage = currentImages[currentIndex];
  const isLast = currentIndex === currentImages.length - 1;
  const nextImage = !isLast
    ? currentImages[currentIndex + 1]
    : nextImages && nextImages.length > 0
      ? nextImages[0]
      : undefined;

  const handleVote = (isLike: boolean) => {
    if (isLoading) return;

    setSelected(isLike ? 'like' : 'dislike');
    setAnimating(true);

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

    setTimeout(() => {
      if (!isLast) {
        setSelected(null);
        setCurrentIndex((prev) => prev + 1);
      } else {
        if (nextImages && nextImages.length > 0) {
          setSelected(null);
          setCurrentPage((prev) => prev + 1);
          setCurrentIndex(0);
        } else {
          console.log('마지막 페이지');
        }
      }
      setAnimating(false);
    }, ANIMATION_DURATION);
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.infoSection}>
        <ProgressBar />
        <p className={styles.infoText}>
          마음에 드는 가구를 선택하면, <br />
          하우미가 사용자님의 취향을 더 잘 이해할 수 있어요!
        </p>
      </section>
      <section className={styles.carouselSection}>
        <div className={styles.imageContainer}>
          {/* 다음 이미지 영역 */}
          {nextImage && (
            <div
              key={`next-${currentPage + 1}-${nextImage.carouselId}`}
              className={`${styles.nextImageArea} ${animating ? styles.nextImageAreaActive : ''}`}
            >
              <img
                src={nextImage.url}
                alt={`다음 가구 이미지 ${nextImage.carouselId}`}
                className={styles.imageStyle}
              />
            </div>
          )}

          {/* 현재 이미지 영역 */}
          {currentImage && (
            <div
              key={`current-${currentPage}-${currentImage.carouselId}`}
              className={`${styles.currentImageArea} ${animating ? styles.currentImageAreaOut : ''}`}
            >
              <img
                src={currentImage.url}
                alt={`현재 가구 이미지 ${currentImage.carouselId}`}
                className={styles.imageStyle}
              />
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <LikeButton
            size={'large'}
            onClick={() => handleVote(true)}
            isSelected={selected === 'like'}
          >
            좋아요
          </LikeButton>
          <DislikeButton
            size={'large'}
            onClick={() => handleVote(false)}
            isSelected={selected === 'dislike'}
          >
            별로예요
          </DislikeButton>
        </div>
      </section>
    </div>
  );
};

export default LoadingPage;
