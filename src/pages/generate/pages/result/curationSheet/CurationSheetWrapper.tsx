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

const THRESHOLD = 100; // 드래그해야 상태 변경 임계값
const THRESHOLD_JUMP = 300; // expanded -> collapsed 바로

interface CurationSheetWrapperProps {
  children: (snapState: 'collapsed' | 'mid' | 'expanded') => ReactNode;
}

export const CurationSheetWrapper = ({
  children,
}: CurationSheetWrapperProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  // 3단계(collapsed, mid, expanded) 상태 관리
  const [snapState, setSnapState] = useState<'collapsed' | 'mid' | 'expanded'>(
    'collapsed'
  );

  const handleDragUp = useCallback(() => {
    if (snapState === 'collapsed') setSnapState('mid');
    else if (snapState === 'mid') setSnapState('expanded');
  }, [snapState]);

  const handleDragDown = useCallback(
    (delta?: number) => {
      const move = delta ?? THRESHOLD;

      if (snapState === 'expanded') {
        // 2단계 한 번에 (바로 닫힘)
        if (move >= THRESHOLD_JUMP) {
          setSnapState('collapsed');
        } else {
          setSnapState('mid');
        }
      } else if (snapState === 'mid') {
        setSnapState('collapsed');
      }
    },
    [snapState]
  );

  const { isDragging, onHandlePointerDown } = useBottomSheetDrag({
    sheetRef,
    threshold: THRESHOLD,
    onDragUp: handleDragUp,
    onDragDown: handleDragDown,
    onDragCancel: () => {},
    mode: 'open-close',
  });

  // backdrop 활성화시 body의 스크롤 막기
  useEffect(() => {
    const lock = snapState !== 'collapsed';

    document.body.style.overflow = lock ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [snapState]);

  return (
    <>
      <div
        className={clsx(
          commonStyles.backdrop,
          (isDragging || snapState === 'expanded') &&
            commonStyles.backdropVisible
        )}
        onClick={() => setSnapState('mid')}
      />

      <div
        ref={sheetRef}
        className={clsx(styles.sheetWrapper, styles.snapStyles[snapState])}
      >
        <div
          className={commonStyles.contentWrapper({ type: 'curation' })}
          onClick={() => {
            if (snapState === 'collapsed') setSnapState('mid');
          }}
        >
          <div
            className={commonStyles.dragHandleContainer({ type: 'curation' })}
            onPointerDown={onHandlePointerDown}
            onClick={(e) => e.stopPropagation()}
          >
            <DragHandle />
          </div>
          {children(snapState)}
        </div>
      </div>
    </>
  );
};
