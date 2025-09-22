import type { ReactNode } from 'react';
import { useRef, useEffect } from 'react';

import clsx from 'clsx';

import { DragHandle } from '@/shared/components/dragHandle/DragHandle';
import { SHEET_BASIC_THRESHOLD } from '@/shared/constants/bottomSheet';
import { useBottomSheetDrag } from '@/shared/hooks/useBottomSheetDrag.ts';

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

  // // 드래그로 닫을 때
  // const animateClose = useCallback(() => {
  //   if (!sheetRef.current) {
  //     onClose();
  //     return;
  //   }
  //   const sheet = sheetRef.current;
  //   sheet.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
  //   sheet.style.transform = 'translate(-50%, 100%)';

  //   setTimeout(() => {
  //     onClose();
  //   }, SHEET_DURATION_MS);
  // }, [onClose]);

  const handleClose = () => {
    onClose();
  };

  const { onHandlePointerDown } = useBottomSheetDrag({
    sheetRef,
    threshold,
    onDragUp: () => {},
    onDragDown: handleClose, // 아래로 드래그하면 닫기
    onDragCancel: () => {},
  });

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
        onClick={handleClose}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleClose();
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
            onPointerDown={onHandlePointerDown}
          >
            <DragHandle />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
