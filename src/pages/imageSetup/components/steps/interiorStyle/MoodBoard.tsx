/**
 * 무드보드 컴포넌트
 *
 * 사용자가 이미지를 선택할 수 있는 무드보드 컴포넌트입니다.
 * 최대 5개까지 이미지를 선택할 수 있으며, 선택 순서대로 1~5번이 표시됩니다.
 * 5개가 선택되면 나머지 이미지들은 비활성화됩니다.
 *
 * @param {number[]} selectedImages - 선택된 이미지들의 ID 배열
 * @param {function} onImageSelect - 이미지 선택/해제 처리 함수
 * @returns JSX.Element - 무드보드 컴포넌트
 */

import { useEffect } from 'react';

import { useMoodBoardQuery } from '@/pages/imageSetup/apis/interiorStyle';
import {
  MOOD_BOARD_CONSTANTS,
  type MoodBoardImageItem,
} from '@/pages/imageSetup/types/apis/interiorStyle';
import CardImage from '@/shared/components/card/cardImage/CardImage';
import SkeletonCardImage from '@/shared/components/card/cardImage/SkeletonCardImage';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

import * as styles from './MoodBoard.css';

interface MoodBoardProps {
  selectedImages: number[];
  onImageSelect: (imageId: number) => void;
}

const MoodBoard = ({ selectedImages, onImageSelect }: MoodBoardProps) => {
  const { handleError } = useErrorHandler('imageSetup');

  /**
   * 이미지의 선택 순서를 반환하는 함수
   *
   * @param {number} imageId - 확인할 이미지의 ID
   * @returns {number} 선택 순서 (1~5), 선택되지 않았으면 0
   */
  const getSelectOrder = (imageId: number) => {
    const index = selectedImages.indexOf(imageId);
    return index !== -1 ? index + 1 : 0;
  };

  // 이미지 API 호출
  const {
    data: moodBoardData,
    isLoading,
    error,
    isError,
  } = useMoodBoardQuery();
  const images = moodBoardData?.data?.moodBoardResponseList || [];
  console.log('이미지: ', images);

  // 3초간만 스켈레톤 보여주기
  // const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (isError) {
      handleError(
        error || new Error('Mood board image load failed'),
        'loading'
      );
    }
  }, [isError, error, handleError]);

  // useEffect(() => {
  //   const timer = setTimeout(() => setShowSkeleton(false), 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  // 로딩/에러 처리
  // if (isLoading || images.length === 0 || showSkeleton) {
  if (isLoading || images.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.gridbox}>
          {Array.from(
            { length: MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT },
            (_, idx) => (
              <SkeletonCardImage key={idx} />
            )
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.gridbox}>
          {images.map((image: MoodBoardImageItem) => {
            const isSelected = selectedImages.includes(image.id);
            const isDisabled =
              selectedImages.length >= MOOD_BOARD_CONSTANTS.MAX_SELECTIONS &&
              !isSelected;

            return (
              <CardImage
                key={image.id}
                src={image.imageUrl}
                alt={'선택 가능한 무드보드 이미지'}
                selectOrder={getSelectOrder(image.id)}
                onClick={() => onImageSelect(image.id)}
                disabled={isDisabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodBoard;
