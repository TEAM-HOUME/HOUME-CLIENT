import { useCallback, useRef, useState, type RefObject } from 'react';
interface UseBottomSheetDragProps {
  sheetRef: RefObject<HTMLDivElement | null>;
  threshold: number;
  onDragUp: () => void;
  onDragDown: (delta?: number) => void;
  onDragCancel: () => void;
  mode?: 'close-only' | 'open-close';
}

interface UseBottomSheetDragReturn {
  isDragging: boolean;
  onHandlePointerDown: (e: React.PointerEvent) => void;
}

/**
 * Pointer Event 기반 드래그 (마우스, 터치, 펜 지원)
 * 바텀시트 드래그/닫기 동작을 담당
 */
export const useBottomSheetDrag = ({
  sheetRef,
  threshold,
  onDragUp,
  onDragDown,
  onDragCancel,
  mode = 'close-only',
}: UseBottomSheetDragProps): UseBottomSheetDragReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!sheetRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      // 드래그 시작 상태 설정 (useRef로 즉시 반영)
      setIsDragging(true);
      isDraggingRef.current = true;

      const startY = e.clientY;

      const target = e.currentTarget as HTMLElement;
      // 포인터 캡처 설정 (윈도우 밖 이동 시에도 이벤트 수신)
      target.setPointerCapture?.(e.pointerId);

      // 포인터 취소/캡처 해제 시 정리
      const handlePointerCancel = () => {
        isDraggingRef.current = false;
        cleanup();
        // 원위치로 복귀
        onDragCancel();
      };

      // 드래그 중 실시간 움직임 처리
      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current || !sheetRef.current) return;

        ev.preventDefault();
        ev.stopPropagation();

        const deltaY = ev.clientY - startY;

        if (mode === 'close-only' && deltaY < 0) {
          return;
        }

        sheetRef.current.style.setProperty('--drag-y', `${deltaY}px`);
        // 드래그 중에는 transition을 비활성화
        sheetRef.current.style.transition = 'none';
      };

      // 드래그 종료 시 동작 결정 (닫기 또는 원위치 복귀)
      const handlePointerUp = (ev: PointerEvent) => {
        if (!isDraggingRef.current) return;
        setIsDragging(false);
        isDraggingRef.current = false;
        const deltaY = ev.clientY - startY; // 드래그를 시작한 지점으로부터의 변화량

        if (mode === 'close-only') {
          if (deltaY > threshold) {
            onDragDown();
          } else {
            onDragCancel();
          }
        } else {
          // 열기/닫기
          if (deltaY > threshold) {
            onDragDown(deltaY);
          } else if (deltaY < -threshold) {
            onDragUp();
          } else {
            onDragCancel();
          }
        }

        cleanup();
      };

      // 이벤트 리스너 정리 함수
      const cleanup = () => {
        target.releasePointerCapture?.(e.pointerId);
        target.removeEventListener('pointermove', handlePointerMove);
        target.removeEventListener('pointerup', handlePointerUp);
        target.removeEventListener('pointercancel', handlePointerCancel);
        target.removeEventListener('lostpointercapture', handlePointerCancel);

        // 드래그가 종료되면 --drag-y 변수를 초기화
        if (sheetRef.current) {
          sheetRef.current.style.setProperty('--drag-y', '0px');
          sheetRef.current.style.transition = ''; // 인라인 transition도 제거
        }
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
    [mode, onDragCancel, onDragDown, onDragUp, sheetRef, threshold]
  );

  return { isDragging, onHandlePointerDown };
};
