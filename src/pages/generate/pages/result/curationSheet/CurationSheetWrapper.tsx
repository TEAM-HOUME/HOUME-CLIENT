import { useRef, useCallback, useEffect, type ReactNode } from 'react';

import clsx from 'clsx';

import { useABTest } from '@/pages/generate/hooks/useABTest';
import {
  logResultImgSwipeCurationSheetDown,
  logResultImgSwipeCurationSheetUp,
} from '@/pages/generate/utils/analytics';
import { DragHandle } from '@/shared/components/dragHandle/DragHandle';
import { useBottomSheetDrag } from '@/shared/hooks/useBottomSheetDrag';

import * as commonStyles from '@components/bottomSheet/BottomSheetWrapper.css';

import * as styles from './CurationSheetWrapper.css';

const THRESHOLD = 100; // 드래그해야 상태 변경 임계값
const THRESHOLD_JUMP = 300; // expanded -> collapsed 바로

interface CurationSheetWrapperProps {
  snapState: 'collapsed' | 'mid' | 'expanded';
  onSnapStateChange: (next: 'collapsed' | 'mid' | 'expanded') => void;
  onCollapsed?: () => void;
  children: (snapState: 'collapsed' | 'mid' | 'expanded') => ReactNode;
}

export const CurationSheetWrapper = ({
  snapState,
  onSnapStateChange,
  onCollapsed,
  children,
}: CurationSheetWrapperProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { variant } = useABTest();

  const handleDragUp = useCallback(() => {
    if (snapState === 'collapsed') {
      onSnapStateChange('mid');
      logResultImgSwipeCurationSheetUp(variant);
    } else if (snapState === 'mid') {
      onSnapStateChange('expanded');
      logResultImgSwipeCurationSheetUp(variant);
    }
  }, [snapState, onSnapStateChange, variant]);

  const handleDragDown = useCallback(
    (delta?: number) => {
      const move = delta ?? THRESHOLD;

      if (snapState === 'expanded') {
        // 2단계 한 번에 (바로 닫힘)
        if (move >= THRESHOLD_JUMP) {
          onSnapStateChange('collapsed');
          logResultImgSwipeCurationSheetDown(variant);
        } else {
          onSnapStateChange('mid');
          logResultImgSwipeCurationSheetDown(variant);
        }
      } else if (snapState === 'mid') {
        onSnapStateChange('collapsed');
        logResultImgSwipeCurationSheetDown(variant);
      }
    },
    [snapState, onSnapStateChange, variant]
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
        onClick={() => onSnapStateChange('mid')}
      />

      <div
        ref={sheetRef}
        className={clsx(styles.sheetWrapper, styles.snapStyles[snapState])}
        onTransitionEnd={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.propertyName !== 'transform') return;
          if (snapState === 'collapsed') {
            onCollapsed?.();
          }
        }}
      >
        <div
          className={commonStyles.contentWrapper({ type: 'curation' })}
          onClick={() => {
            if (snapState === 'collapsed') onSnapStateChange('mid');
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
