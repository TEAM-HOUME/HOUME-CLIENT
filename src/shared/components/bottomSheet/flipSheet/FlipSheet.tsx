import { useRef } from 'react';

import clsx from 'clsx';

import FilpButton from '@/shared/components/button/flipButton/FlipButton';

import CtaButton from '@components/button/ctaButton/CtaButton';
import DragHandle from '@components/dragHandle/DragHandle';

import * as styles from './FlipSheet.css';

interface FlipSheetProps {
  onFlipClick: () => void;
  onChooseClick: () => void;
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  src: string;
  isFlipped: boolean;
}

const FlipSheet = ({
  onFlipClick,
  onChooseClick,
  isOpen,
  onClose,
  onExited,
  src,
  isFlipped,
}: FlipSheetProps) => {
  const sheetRef = useRef<HTMLDivElement | null>(null); // bottom sheet DOM 참조

  // CSS transition이 끝났을 때 호출
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (!isOpen && e.propertyName === 'transform') {
      onExited?.();
    }
  };

  return (
    <>
      <div
        className={clsx(styles.backdrop, isOpen && styles.backdropVisible)}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={clsx(
          styles.sheetWrapper,
          isOpen ? styles.sheetWrapperExpanded : styles.sheetWrapperCollapsed
        )}
        onTransitionEnd={handleTransitionEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.imageArea}>
          <div className={styles.dragHandleContainer}>
            <DragHandle onClick={onClose} />
          </div>
          <p className={styles.infoText}>이미지를 좌우반전 할 수 있어요</p>
          <div className={styles.imageContainer}>
            <img
              src={src}
              alt="선택된 구조 이미지"
              className={
                isFlipped
                  ? styles.imageVariants.flipped
                  : styles.imageVariants.normal
              }
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <FilpButton onClick={onFlipClick} isFlipped={false} />
          <CtaButton onClick={onChooseClick}>선택하기</CtaButton>
        </div>
      </div>
    </>
  );
};

export default FlipSheet;
