import type { ReactNode } from 'react';
import { useRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import * as styles from './flipSheet/FlipSheet.css';
import { DragHandle } from '@/shared/components/dragHandle/DragHandle';

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
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // 바텀시트 열기/닫기 시 초기 위치 설정
  useEffect(() => {
    if (sheetRef.current) {
      if (isOpen) {
        // 열린 상태
        sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
        sheetRef.current.style.transform = 'translate(-50%, 0)';
      } else {
        // 닫힌 상태
        sheetRef.current.style.transition = 'none';
        sheetRef.current.style.transform = 'translate(-50%, 100%)';
      }
    }
  }, [isOpen]);

  // 드래그로 닫을 때
  const animateClose = useCallback(() => {
    if (!sheetRef.current) {
      onClose();
      return;
    }
    const sheet = sheetRef.current;
    // 하단으로 이동 후 onClose 호출
    sheet.style.transition = 'transform 0.3s ease-in-out';
    sheet.style.transform = 'translate(-50%, 100%)';

    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Pointer Event 기반 드래그 (마우스, 터치, 펜 모두 지원)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 드래그 시작 상태 설정 (useRef로 즉시 반영)
      isDraggingRef.current = true;
      const startY = e.clientY;

      // 드래그 중 실시간 움직임 처리
      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current) return;

        ev.preventDefault();
        ev.stopPropagation();

        const deltaY = ev.clientY - startY;

        if (deltaY > 0 && sheetRef.current) {
          // 드래그 거리를 threshold 내에서 제한하여 자연스러운 움직임 구현
          const translateY = Math.min(deltaY, threshold);
          sheetRef.current.style.transform = `translate(-50%, ${translateY}px)`;
          // 드래그 중에는 transition을 비활성화
          sheetRef.current.style.transition = 'none';
        }
      };

      // 드래그 종료 시 동작 결정 (닫기 또는 원위치 복귀)
      const handlePointerUp = (ev: PointerEvent) => {
        isDraggingRef.current = false;
        const deltaY = ev.clientY - startY;

        if (sheetRef.current) {
          if (deltaY > threshold) {
            // threshold를 넘으면 닫기
            sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
            sheetRef.current.style.transform = 'translate(-50%, 100%)';
            setTimeout(() => {
              onClose();
            }, 300);
          } else {
            // threshold 미만이면 원위치로 복귀
            sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
            sheetRef.current.style.transform = 'translate(-50%, 0)';
          }
        }

        // 이벤트 리스너 정리
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      // 전역 이벤트 리스너 등록
      document.addEventListener('pointermove', handlePointerMove, {
        passive: false, // 페이지 스크롤 방지
      });
      document.addEventListener('pointerup', handlePointerUp, {
        passive: false,
      });
    },
    [threshold, onClose]
  );

  return (
    <>
      <div
        className={clsx(styles.backdrop, isOpen && styles.backdropVisible)}
        onClick={animateClose}
        onTouchStart={(e) => {
          e.stopPropagation();
          animateClose();
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
            onPointerDown={handlePointerDown}
          >
            <DragHandle />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
