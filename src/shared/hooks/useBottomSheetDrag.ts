import { useRef, useState, useCallback, useEffect } from 'react';
import { SHEET_DURATION_MS } from '../constants/bottomSheet';

interface UseBottomSheetDragProps {
  onClose: () => void;
  threshold?: number; // 드래그로 닫히는 임계치(px)
}

export const useBottomSheetDrag = ({
  onClose,
  threshold = 100,
}: UseBottomSheetDragProps) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false); // 드래그 중 여부

  // 닫기 애니메이션 (시트 변경 후 onClose 호출)
  const animateClose = useCallback(() => {
    if (!sheetRef.current) {
      onClose();
      return;
    }
    const el = sheetRef.current;
    el.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
    el.style.transform = 'translate(-50%, 100%)';

    window.setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
      onClose();
    }, 300);
  }, [onClose]);

  // Pointer Event 기반 드래그 (마우스, 터치, 펜 모두 처리)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      const startY = e.clientY;

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDragging) return;

        ev.preventDefault();
        ev.stopPropagation();

        const deltaY = ev.clientY - startY;

        if (deltaY > 0 && sheetRef.current) {
          const translateY = Math.min(deltaY, threshold);
          sheetRef.current.style.transform = `translate(-50%, ${translateY}px)`;
          sheetRef.current.style.transition = 'none';
        }
      };

      const handlePointerUp = (ev: PointerEvent) => {
        setIsDragging(false);
        const deltaY = ev.clientY - startY;

        if (sheetRef.current) {
          if (deltaY > threshold) {
            animateClose();
          } else {
            sheetRef.current.style.transform = 'translate(-50%, 0)';
            sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ease-in-out`;
          }
        }

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [threshold, animateClose, isDragging]
  );

  // 정리
  useEffect(() => {
    const el = sheetRef.current;
    return () => {
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
      }
    };
  }, []);

  return {
    sheetRef,
    isDragging,
    handlePointerDown,
    closeWithAnimation: animateClose,
  };
};
