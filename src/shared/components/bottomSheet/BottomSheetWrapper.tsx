import type { ReactNode } from 'react';
import { useRef, useCallback, useEffect } from 'react';

import clsx from 'clsx';

import { DragHandle } from '@/shared/components/dragHandle/DragHandle';
import {
  SHEET_DURATION_MS,
  SHEET_BASIC_THRESHOLD,
} from '@/shared/constants/bottomSheet';

import * as styles from './BottomSheetWrapper.css.ts';

interface BottomSheetWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  children: ReactNode;
  threshold?: number;
  typeVariant?: 'basic' | 'curation';
}

export const BottomSheetWrapper = ({
  isOpen,
  onClose,
  onExited,
  children,
  threshold = SHEET_BASIC_THRESHOLD,
  typeVariant = 'basic',
}: BottomSheetWrapperProps) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // 바텀시트 열기/닫기 시 초기 위치 설정
  useEffect(() => {
    if (sheetRef.current) {
      if (isOpen) {
        // 열린 상태
        sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
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
    sheet.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
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
      const target = e.currentTarget as HTMLElement;

      // 포인터 캡처 설정 (윈도우 밖 이동 시에도 이벤트 수신)
      target.setPointerCapture?.(e.pointerId);

      // 이벤트 리스너 정리 함수
      const cleanup = () => {
        target.releasePointerCapture?.(e.pointerId);
        target.removeEventListener('pointermove', handlePointerMove);
        target.removeEventListener('pointerup', handlePointerUp);
        target.removeEventListener('pointercancel', handlePointerCancel);
        target.removeEventListener('lostpointercapture', handlePointerCancel);
      };

      // 포인터 취소/캡처 해제 시 정리
      const handlePointerCancel = () => {
        isDraggingRef.current = false;
        // 원위치로 복귀
        if (sheetRef.current) {
          sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
          sheetRef.current.style.transform = 'translate(-50%, 0)';
        }
        cleanup();
      };

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
            sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
            sheetRef.current.style.transform = 'translate(-50%, 100%)';
            setTimeout(() => {
              onClose();
            }, 300);
          } else {
            // threshold 미만이면 원위치로 복귀
            sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
            sheetRef.current.style.transform = 'translate(-50%, 0)';
          }
        }

        cleanup();
      };

      // 대상 요소에 이벤트 리스너 등록
      target.addEventListener('pointermove', handlePointerMove, {
        passive: false,
      });
      target.addEventListener('pointerup', handlePointerUp, {
        passive: false,
      });
      target.addEventListener('pointercancel', handlePointerCancel, {
        passive: false,
      });
      target.addEventListener('lostpointercapture', handlePointerCancel, {
        passive: false,
      });
    },
    [threshold, onClose]
  );

  // bottom sheet 열렸을 때 body의 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    // 컴포넌트가 언마운트되거나 isOpen 상태가 false로 바뀔 때의 클린업(cleanup) 함수
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        role="dialog"
        aria-modal="true"
        className={clsx(
          styles.sheetWrapper,
          styles.sheetState[isOpen ? 'expanded' : 'collapsed']
        )}
        onTransitionEnd={(e) => {
          // 닫힘 애니메이션이 끝났을 때만 onExited 호출
          if (e.propertyName !== 'transform') return;
          if (!isOpen) onExited?.();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className={styles.contentWrapper({
            type: typeVariant,
          })}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className={styles.dragHandleContainer({
              type: typeVariant,
            })}
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
