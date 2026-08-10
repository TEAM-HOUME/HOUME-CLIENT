import type { ReactNode } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import BottomSheetBase from './BottomSheetBase';
import * as styles from './BottomSheetBase.css';
import {
  DRAG_THRESHOLD_PX,
  PERSISTENT_EXPAND_RATIO,
  SHEET_TRANSITION_MS,
} from './constants';

interface DragHandleBottomSheetProps {
  open: boolean;
  contentSlot: ReactNode;
  primaryButton: ReactNode;
  secondaryButton?: ReactNode;
  onExpandedChange?: (expanded: boolean) => void;
  /** 부모에서 expanded가 바뀔 때 패널 높이 동기화 */
  expanded?: boolean;
  /** 최소 높이 (rem 문자열). 있으면 Persistent 모드, 없으면 Dismissible 모드 */
  collapsedHeight?: string;
  /** Dismissible 모드에서 바텀시트가 닫혀야 할 때 부모에게 알리는 콜백 */
  onDismiss?: () => void;
  /** 스크롤 다운 시 최소화 상태(핸들 + 썸네일만). Persistent 모드에서만 유효 (기본: false) */
  minimized?: boolean;
  /** 최소화 시 패널 높이 (rem 문자열). minimized일 때만 사용 */
  minimizedHeight?: string;
  /** 최소화 상태에서 드래그가 시작될 때 부모에게 복원을 알리는 콜백 */
  onRestoreFromMinimized?: () => void;
}

// 'snapping' = collapsed → expanded snap 중 콘텐츠 자연 높이로 부드럽게 보간하는 단계
// (px → auto 점프로 인한 디핑 방지)
type DragPhase = 'idle' | 'dragging' | 'snapping';

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
  expanded: expandedFromParent,
  collapsedHeight,
  onDismiss,
  minimized = false,
  minimizedHeight,
  onRestoreFromMinimized,
}: DragHandleBottomSheetProps) => {
  const isPersistent = collapsedHeight !== undefined;

  // 내부 expanded 초기값을 부모 prop과 똑같이 맞춤
  // 마운트 시 내부(expanded)와 부모(expandedFromParent)가 어긋나면,
  // 부모→자식(아래 effect)/자식→부모(onExpandedChange effect) 양방향 동기화가
  // 서로 반대값으로 끊임없이 진동 -> Maximum update depth 오류 발생
  // expandedFromParent 미전달(Dismissible 모드)이면 기존과 동일하게 !isPersistent.
  const [expanded, setExpanded] = useState(expandedFromParent ?? !isPersistent);

  useEffect(() => {
    if (expandedFromParent !== undefined) {
      setExpanded(expandedFromParent);
    }
  }, [expandedFromParent]);

  // ── 상태 · refs ──

  const [dragPhase, setDragPhase] = useState<DragPhase>('idle');
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  // BottomSheetBase가 mount하는 panel DOM (PointerDown 시 측정용)
  const panelNodeRef = useRef<HTMLDivElement | null>(null);
  // BottomSheetBase가 mount하는 스크롤 컨테이너(contentSlot) DOM (body 드래그 시 scrollTop 측정용)
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const currentHeightRef = useRef(0);
  const collapsedPxRef = useRef(0);
  const expandedPxRef = useRef(0);
  const draggedRef = useRef(false);
  const finishedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  // body(콘텐츠) 영역 터치 드래그용
  const bodyStartYRef = useRef(0); // 터치 시작 y (방향 판단 기준)
  const bodyTakenOverRef = useRef(false); // 콘텐츠 스크롤 → 시트 드래그로 takeover 했는지

  // ── effects (부모 expanded 동기화 / snapping 보간) ──

  // 부모에 expanded 변경을 알릴 때만 호출 (onExpandedChange 참조 변경만으로 재호출하지 않음)
  const onExpandedChangeRef = useRef(onExpandedChange);
  onExpandedChangeRef.current = onExpandedChange;
  const prevExpandedNotifiedRef = useRef(expanded);

  useEffect(() => {
    if (prevExpandedNotifiedRef.current === expanded) return;

    prevExpandedNotifiedRef.current = expanded;
    onExpandedChangeRef.current?.(expanded);
  }, [expanded]);

  // snapping phase: collapsed → expanded snap 시 콘텐츠 자연 높이 측정 + transition으로 보간
  useLayoutEffect(() => {
    if (dragPhase !== 'snapping') return undefined;
    const panel = panelNodeRef.current;
    if (!panel) return undefined;

    // panel.style.height를 잠깐 auto로 두고 콘텐츠 자연 높이 측정 후 복원
    // useLayoutEffect는 paint 전 동기 실행이라 깜빡임 발생 X
    const prevHeight = panel.style.height;
    panel.style.height = 'auto';
    const naturalH = panel.offsetHeight;
    panel.style.height = prevHeight;

    // 측정값으로 transition (현재 dragHeight → naturalH로 부드럽게 보간)
    setDragHeight(naturalH);

    // transition 종료 후 idle + height auto로 정리 (naturalH ≈ auto라 점프 없음)
    const timer = window.setTimeout(() => {
      setDragHeight(null);
      setDragPhase('idle');
    }, SHEET_TRANSITION_MS + 50);

    return () => {
      clearTimeout(timer);
    };
  }, [dragPhase]);

  // ── 드래그 코어 (핸들 pointer / body touch 공용, 입력 좌표만 받음) ──

  // 드래그 시작: 측정값 스냅샷 + 플래그 리셋 (capture는 호출부에서 처리)
  const beginDrag = useCallback(
    (clientY: number, panel: HTMLDivElement) => {
      const collapsedPx = isPersistent
        ? parsePxFromRem(collapsedHeight as string)
        : 0;
      const expandedPx = resolveExpandedPx();
      // 최소화 상태에서 드래그 시작 시엔 패널 실측(minimizedHeight)이 아니라 collapsed 높이를 기준으로 삼아, clamp 데드존/점프 없이 collapsed에서 확장 드래그가 이어지도록 함
      const startHeight =
        isPersistent && minimized ? collapsedPx : panel.offsetHeight;

      startYRef.current = clientY;
      startHeightRef.current = startHeight;
      currentHeightRef.current = startHeight;
      collapsedPxRef.current = collapsedPx;
      expandedPxRef.current = expandedPx;
      draggedRef.current = false;
      finishedRef.current = false;
    },
    [isPersistent, collapsedHeight, minimized]
  );

  // 드래그 이동: delta → height clamp → setDragHeight
  const applyDragMove = useCallback(
    (clientY: number) => {
      if (finishedRef.current) return;

      // 위로 끌면 양수 (height 증가 방향)
      const delta = startYRef.current - clientY;

      if (!draggedRef.current) {
        if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
        draggedRef.current = true;
        setDragPhase('dragging');
      }

      const minH = isPersistent ? collapsedPxRef.current : 0;
      const next = Math.max(
        minH,
        Math.min(expandedPxRef.current, startHeightRef.current + delta)
      );

      currentHeightRef.current = next;
      setDragHeight(next);
    },
    [isPersistent]
  );

  // 드래그 종료: expand/collapse/dismiss 판정 (cancelled=true면 원위치 복귀)
  const endDrag = useCallback(
    (cancelled: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      // 단순 탭 (임계 미통과)
      if (!draggedRef.current) {
        setDragPhase('idle');
        return;
      }

      // cancel: 원위치 복귀
      if (cancelled) {
        currentHeightRef.current = startHeightRef.current;
        setDragHeight(null);
        setDragPhase('idle');
        return;
      }

      const h = currentHeightRef.current;
      const collapsedPx = collapsedPxRef.current;
      const expandedPx = expandedPxRef.current;

      if (isPersistent) {
        // collapsed~expanded 구간의 20% 지점만 넘으면 expanded snap
        const threshold =
          collapsedPx + (expandedPx - collapsedPx) * PERSISTENT_EXPAND_RATIO;
        const shouldExpand = h > threshold;

        if (shouldExpand && !expanded) {
          // collapsed → expanded: 콘텐츠 자연 높이로 부드럽게 보간 (snapping phase)
          // dragHeight 유지, useLayoutEffect에서 naturalH 측정 후 transition
          setExpanded(true);
          setDragPhase('snapping');
          return;
        }

        // 그 외(이미 expanded → expanded 유지 / expanded → collapsed / collapsed 유지):
        // height: dragHeight → collapsedHeight 또는 auto 점프 (점프 시각상 미미)
        setExpanded(shouldExpand);
      } else {
        const midPoint = expandedPx / 2;
        if (h > midPoint) {
          setExpanded(true);
        } else {
          onDismiss?.();
        }
      }

      setDragHeight(null);
      setDragPhase('idle');
    },
    [isPersistent, onDismiss, expanded]
  );

  // ── 핸들(dragHeader) pointer 핸들러 ──

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const panel = panelNodeRef.current;
      if (!panel) return;

      e.stopPropagation();
      if (isPersistent && minimized) onRestoreFromMinimized?.();
      beginDrag(e.clientY, panel);
      pointerIdRef.current = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [beginDrag, isPersistent, minimized, onRestoreFromMinimized]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (pointerIdRef.current !== e.pointerId) return;
      applyDragMove(e.clientY);
    },
    [applyDragMove]
  );

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      pointerIdRef.current = null;
      endDrag(e.type === 'pointercancel');
    },
    [endDrag]
  );

  // ── body(콘텐츠) 영역 touch 핸들러 ──
  // pointer는 contentSlot의 touch-action:pan-y 때문에 스크롤 시 pointercancel로 끊김 →
  // body 드래그는 touch 이벤트로 구현. 조건 충족 시에만 시트 드래그로 takeover (그 외 native 스크롤).
  const handleBodyTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    bodyStartYRef.current = e.touches[0].clientY;
    bodyTakenOverRef.current = false;
  }, []);

  const handleBodyTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      const y = e.touches[0].clientY;

      // 이미 takeover 했으면 계속 시트 드래그
      if (bodyTakenOverRef.current) {
        applyDragMove(y);
        return;
      }

      const panel = panelNodeRef.current;
      if (!panel) return;

      const dir = y - bodyStartYRef.current; // + = 아래로
      const atTop = (contentScrollRef.current?.scrollTop ?? 0) <= 0;

      // collapsed: 위로 끌면 expand / expanded: 맨 위에서 아래로 끌면 collapse·dismiss
      const shouldExpand = !expanded && dir < -DRAG_THRESHOLD_PX;
      const shouldCollapse = expanded && dir > DRAG_THRESHOLD_PX && atTop;
      if (!shouldExpand && !shouldCollapse) return;

      // takeover: 현재 y 기준으로 드래그 시작 (점프 없이 이 지점부터 시트 이동)
      bodyTakenOverRef.current = true;
      if (isPersistent && minimized) onRestoreFromMinimized?.();
      beginDrag(y, panel);
      draggedRef.current = true;
      setDragPhase('dragging');
      applyDragMove(y);
    },
    [
      expanded,
      beginDrag,
      applyDragMove,
      isPersistent,
      minimized,
      onRestoreFromMinimized,
    ]
  );

  const handleBodyTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!bodyTakenOverRef.current) return;
      bodyTakenOverRef.current = false;
      endDrag(e.type === 'touchcancel');
    },
    [endDrag]
  );

  // ── 뷰 파생값 · 오버레이 핸들러 ──

  const computeDimOpacity = (): number => {
    if (dragPhase !== 'dragging' || dragHeight === null) {
      return isPersistent ? (expanded ? 1 : 0) : 1;
    }
    if (isPersistent) {
      const range = expandedPxRef.current - collapsedPxRef.current;
      if (range <= 0) return 0;
      const progress = (dragHeight - collapsedPxRef.current) / range;
      return Math.max(0, Math.min(1, progress));
    }
    const expandedPx = expandedPxRef.current;
    if (expandedPx <= 0) return 0;
    return Math.max(0, Math.min(1, dragHeight / expandedPx));
  };

  // expanded일 땐 minimized 무시 (안전 가드). minimized는 항상 collapsed의 서브상태
  const isMinimized = isPersistent && minimized && !expanded;

  // panel height 결정 (dragging > expanded > minimized > collapsed 우선순위)
  const panelStyle: React.CSSProperties =
    dragPhase === 'dragging' && dragHeight !== null
      ? { height: `${dragHeight}px` }
      : isPersistent
        ? {
            height: expanded
              ? 'auto'
              : isMinimized && minimizedHeight
                ? minimizedHeight
                : collapsedHeight,
          }
        : {};

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
      expanded={expanded}
      minimized={isMinimized}
      contentSlot={contentSlot}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
      panelRef={panelNodeRef}
      panelStyle={panelStyle}
      disableTransition={dragPhase === 'dragging'}
      onOverlayClick={handleOverlayClick}
      backgroundInteractable={
        isPersistent && !expanded && dragPhase !== 'dragging'
      }
      dimOpacity={computeDimOpacity()}
      preventScroll={!isPersistent || expanded}
      handleSlot={<span className={styles.dragHandleButton} aria-hidden />}
      dragHandlerProps={{
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: finishDrag,
        onPointerCancel: finishDrag,
        onLostPointerCapture: finishDrag,
      }}
      contentScrollRef={contentScrollRef}
      contentTouchHandlers={{
        onTouchStart: handleBodyTouchStart,
        onTouchMove: handleBodyTouchMove,
        onTouchEnd: handleBodyTouchEnd,
        onTouchCancel: handleBodyTouchEnd,
      }}
    />
  );
};

export default DragHandleBottomSheet;
