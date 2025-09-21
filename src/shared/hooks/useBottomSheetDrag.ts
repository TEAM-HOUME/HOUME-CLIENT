import { useCallback, useRef, type RefObject } from 'react';
interface UseBottomSheetDragProps {
  sheetRef: RefObject<HTMLDivElement | null>;
  threshold: number;
  onDragUp: () => void;
  onDragDown: () => void;
  onDragCancel: () => void;
}

interface UseBottomSheetDragReturn {
  onHandlePointerDown: (e: React.PointerEvent) => void;
}

/**
 * Pointer Event 기반 드래그 (마우스, 터치, 펜 지원)
 * 바텀시트 드래그/닫기 동작을 담당
 * backdrop 닫기에도 동일 애니메이션을 재사용할 수 있도록 animateClose 제공
 */
export const useBottomSheetDrag = ({
  sheetRef,
  threshold,
  onDragUp,
  onDragDown,
  onDragCancel,
}: UseBottomSheetDragProps): UseBottomSheetDragReturn => {
  const isDraggingRef = useRef(false);

  const onHandlePointerDown = useCallback(
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
        onDragCancel();
        cleanup();
      };

      // 드래그 중 실시간 움직임 처리
      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current) return;

        ev.preventDefault();
        ev.stopPropagation();

        const deltaY = ev.clientY - startY;

        if (deltaY > 0 && sheetRef.current) {
          sheetRef.current.style.transform = `translate(-50%, ${deltaY}px)`;
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
            // 아래로 임계값 이상 드래그
            onDragDown();
          } else if (deltaY < -threshold) {
            // 아래로 임계값 이상 드래그
            onDragUp();
          } else {
            // 임계값 미만 -> 원위치
            onDragCancel();
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
    [onDragCancel, onDragDown, onDragUp, sheetRef, threshold]
  );

  return { onHandlePointerDown };
};
