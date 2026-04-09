import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import BottomSheetBase from './BottomSheetBase';
import * as styles from './BottomSheetBase.css';

interface DragHandleBottomSheetProps {
  open: boolean;
  contentSlot: ReactNode;
  primaryButton: ReactNode;
  secondaryButton?: ReactNode;
  onExpandedChange?: (expanded: boolean) => void;
  /** 최소 높이 (rem 문자열). 있으면 Persistent(최소높이 존재) 모드, 없으면 Dismissible 모드 */
  collapsedHeight?: string;
  /** Dismissible 모드에서 바텀시트가 사라질 때 부모에게 알리는 콜백 (부모가 open을 false로 바꿈) */
  onDismiss?: () => void;
}

const EXPANDED_HEIGHT = 'calc(100dvh - 10.4rem)';

const parsePxFromRem = (rem: string): number => {
  const value = parseFloat(rem);
  const fontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return value * fontSize;
};

const resolveExpandedPx = (): number =>
  window.innerHeight - parsePxFromRem('10.4rem');

const DragHandleBottomSheet = ({
  open,
  contentSlot,
  primaryButton,
  secondaryButton,
  onExpandedChange,
  collapsedHeight,
  onDismiss,
}: DragHandleBottomSheetProps) => {
  const isPersistent = collapsedHeight !== undefined;

  const [expanded, setExpanded] = useState(!isPersistent);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const startHeightRef = useRef(0);
  const collapsedPxRef = useRef(0);
  const expandedPxRef = useRef(0);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      dragStartYRef.current = e.clientY;
      startHeightRef.current = panel.offsetHeight;
      // Persistent: 최소 높이에서 멈춤 / Dismissible: 높이가 0까지 줄어들 수 있음
      collapsedPxRef.current = isPersistent
        ? parsePxFromRem(collapsedHeight)
        : 0;
      expandedPxRef.current = resolveExpandedPx();

      setIsDragging(true);
      setDragHeight(panel.offsetHeight);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isPersistent, collapsedHeight]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const delta = dragStartYRef.current - e.clientY;
      const newHeight = startHeightRef.current + delta;
      const clamped = Math.max(
        collapsedPxRef.current,
        Math.min(expandedPxRef.current, newHeight)
      );
      setDragHeight(clamped);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || dragHeight == null) return;

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);

      if (isPersistent) {
        // Persistent: 절반 기준으로 expand/collapse 토글
        const midPoint = (collapsedPxRef.current + expandedPxRef.current) / 2;
        setExpanded(dragHeight > midPoint);
      } else {
        // Dismissible: 절반 이하면 dismiss, 이상이면 snap back
        const midPoint = expandedPxRef.current / 2;
        if (dragHeight > midPoint) {
          setExpanded(true);
        } else {
          onDismiss?.();
        }
      }
      setDragHeight(null);
    },
    [isDragging, dragHeight, isPersistent, onDismiss]
  );

  const getDimOpacity = (): number => {
    if (isPersistent) {
      // Persistent: collapsed(0) ~ expanded(1) 사이를 선형 보간
      if (!isDragging || dragHeight == null) return expanded ? 1 : 0;

      const range = expandedPxRef.current - collapsedPxRef.current;
      if (range <= 0) return 0;

      const progress = (dragHeight - collapsedPxRef.current) / range;
      return Math.max(0, Math.min(1, progress));
    }

    // Dismissible: 항상 dim 표시, 드래그 중에는 높이에 비례
    if (!isDragging || dragHeight == null) return 1;

    const progress = dragHeight / expandedPxRef.current;
    return Math.max(0, Math.min(1, progress));
  };

  const panelStyle: React.CSSProperties =
    isDragging && dragHeight != null
      ? { height: `${dragHeight}px` }
      : isPersistent
        ? { height: expanded ? EXPANDED_HEIGHT : collapsedHeight }
        : {}; // Dismissible: content 높이(auto) + CSS maxHeight가 상한

  const handleOverlayClick = () => {
    if (isPersistent) {
      setExpanded(false);
    } else {
      onDismiss?.();
    }
  };

  return (
    <BottomSheetBase
      open={open}
      headerType="dragHandle"
      contentSlot={contentSlot}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
      panelRef={panelRef}
      panelStyle={panelStyle}
      dimOpacity={getDimOpacity()}
      disableTransition={isDragging}
      onOverlayClick={handleOverlayClick}
      // Persistent collapsed 상태에서만 뒷배경 터치·스크롤 가능
      backgroundInteractable={isPersistent && !expanded && !isDragging}
      preventScroll={!isPersistent || expanded}
      handleSlot={
        <button
          type="button"
          aria-label="바텀시트 크기 조절"
          className={styles.dragHandleButton}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      }
    />
  );
};

export default DragHandleBottomSheet;
