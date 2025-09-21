import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import clsx from 'clsx';

import { DragHandle } from '@/shared/components/dragHandle/DragHandle';
import { useBottomSheetDrag } from '@/shared/hooks/useBottomSheetDrag';

import * as commonStyles from '@components/bottomSheet/BottomSheetWrapper.css';

import * as styles from './CurationSheetWrapper.css';

const PEEK_HEIGHT = '8.8rem';
const THRESHOLD = 150; // 드래그해야 상태 변경 임계값

interface CurationSheetWrapperProps {
  children: ReactNode;
}

export const CurationSheetWrapper = ({
  children,
}: CurationSheetWrapperProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 드래그 후 인라인 transform 스타일을 초기화
  // 없을 경우 바텀시트 닫을 때 기존 바텀시트들처럼 완전히 닫힘
  const resetTransform = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = '';
      sheetRef.current.style.transform = '';
    }
  }, []);

  const handleDragUp = useCallback(() => {
    setIsExpanded(true);
    resetTransform();
  }, [resetTransform]);

  const handleDragDown = useCallback(() => {
    // 확장된 상태에서만 축소되도록 처리
    if (isExpanded) {
      setIsExpanded(false);
    }
    resetTransform();
  }, [isExpanded, resetTransform]);

  const handleDragCancel = useCallback(() => {
    resetTransform();
    // 드래그가 취소되면 아무것도 하지 않음
  }, [resetTransform]);

  const { onHandlePointerDown } = useBottomSheetDrag({
    sheetRef,
    threshold: THRESHOLD,
    onDragUp: handleDragUp,
    onDragDown: handleDragDown,
    onDragCancel: handleDragCancel,
  });

  // backdrop 활성화시 body의 스크롤 막기
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  return (
    <>
      <div
        className={clsx(
          commonStyles.backdrop,
          isExpanded && commonStyles.backdropVisible
        )}
        onClick={() => setIsExpanded(false)}
      />

      <div
        ref={sheetRef}
        className={styles.sheetWrapper}
        style={{ maxHeight: isExpanded ? '100vh' : PEEK_HEIGHT }}
      >
        <div className={commonStyles.contentWrapper({ type: 'curation' })}>
          <div
            className={commonStyles.dragHandleContainer({ type: 'curation' })}
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
