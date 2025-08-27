import type { ReactNode } from 'react';
import clsx from 'clsx';
import * as styles from './flipSheet/FlipSheet.css';
import { DragHandle } from '@/shared/components/dragHandle/DragHandle';
import { useBottomSheetDrag } from '@/shared/hooks/useBottomSheetDrag';

interface BottomSheetWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  children: ReactNode;
  threshold?: number;
}

export const BottomSheetWrapper = ({
  isOpen,
  onClose,
  onExited,
  children,
  threshold = 150,
}: BottomSheetWrapperProps) => {
  const { sheetRef, handleMouseDown, handleTouchStart, closeWithAnimation } =
    useBottomSheetDrag({
      onClose,
      threshold,
    });

  return (
    <>
      <div
        className={clsx(styles.backdrop, isOpen && styles.backdropVisible)}
        onClick={closeWithAnimation}
        onTouchStart={(e) => {
          e.stopPropagation();
          closeWithAnimation();
        }}
      />
      <div
        ref={sheetRef}
        data-sheet="true"
        className={clsx(
          styles.sheetWrapper,
          isOpen ? styles.sheetWrapperExpanded : styles.sheetWrapperCollapsed
        )}
        onTransitionEnd={onExited}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div
          className={styles.contentWrapper}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className={styles.dragHandleContainer}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const startY = e.clientY;
              // data-sheet 속성을 가진 가장 가까운 부모 요소 찾기
              const sheet = e.currentTarget.closest(
                '[data-sheet]'
              ) as HTMLElement;

              if (!sheet) return;

              const handlePointerMove = (ev: PointerEvent) => {
                ev.preventDefault();
                ev.stopPropagation();

                const deltaY = ev.clientY - startY;
                if (deltaY > 0) {
                  // 드래그 거리를 threshold 내에서 제한하여 자연스러운 움직임 구현
                  const translateY = Math.min(deltaY, threshold);
                  sheet.style.transform = `translate(-50%, ${translateY}px)`;
                  // 드래그 중에는 transition을 비활성화하여 실시간 움직임 구현
                  sheet.style.transition = 'none';
                }
              };

              const handlePointerUp = (ev: PointerEvent) => {
                const deltaY = ev.clientY - startY;

                if (deltaY > threshold) {
                  // threshold를 넘으면 닫기 애니메이션 실행
                  sheet.style.transition = 'transform 0.3s ease-in-out';
                  sheet.style.transform = 'translate(-50%, 100%)';
                  setTimeout(() => {
                    onClose();
                  }, 300);
                } else {
                  // threshold 미만이면 원위치로 복귀
                  sheet.style.transform = 'translate(-50%, 0)';
                  sheet.style.transition = 'transform 0.3s ease-in-out';
                }

                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
              };

              document.addEventListener('pointermove', handlePointerMove);
              document.addEventListener('pointerup', handlePointerUp);
            }}
          >
            <DragHandle />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
