import { useRef, useState, useCallback, useEffect } from 'react';

interface UseBottomSheetDragProps {
  onClose: () => void;
  threshold?: number; // 드래그로 닫히는 임계치(px)
}

export const useBottomSheetDrag = ({
  onClose,
  threshold = 100,
}: UseBottomSheetDragProps) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // 닫기 애니메이션
  const animateClose = useCallback(() => {
    if (!sheetRef.current) {
      onClose();
      return;
    }
    const el = sheetRef.current;
    el.style.transition = 'transform 0.3s ease-in-out';
    el.style.transform = 'translate(-50%, 100%)';

    window.setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
      onClose();
    }, 300);
  }, [onClose]);

  // 마우스 드래그
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      startYRef.current = e.clientY;
      currentYRef.current = e.clientY;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging) return;

        ev.preventDefault();
        const deltaY = ev.clientY - startYRef.current;
        currentYRef.current = ev.clientY;

        if (deltaY > 0 && sheetRef.current) {
          const translateY = Math.min(deltaY, threshold);
          sheetRef.current.style.transform = `translate(-50%, ${translateY}px)`;
          sheetRef.current.style.transition = 'none';
        }
      };

      const handleMouseUp = (ev: MouseEvent) => {
        setIsDragging(false);
        const deltaY = ev.clientY - startYRef.current;

        if (sheetRef.current) {
          if (deltaY > threshold) {
            animateClose();
          } else {
            sheetRef.current.style.transform = 'translate(-50%, 0)';
            sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
          }
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [threshold, animateClose, isDragging]
  );

  // 터치 드래그
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // 모바일 터치 이벤트 강화
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = e.touches[0].clientY;

      const handleTouchMove = (ev: TouchEvent) => {
        if (!isDragging) return;

        // 모바일에서 스크롤 방지
        ev.preventDefault();
        ev.stopPropagation();

        const deltaY = ev.touches[0].clientY - startYRef.current;
        currentYRef.current = ev.touches[0].clientY;

        if (deltaY > 0 && sheetRef.current) {
          const translateY = Math.min(deltaY, threshold);
          sheetRef.current.style.transform = `translate(-50%, ${translateY}px)`;
          sheetRef.current.style.transition = 'none';
        }
      };

      const handleTouchEnd = (ev: TouchEvent) => {
        setIsDragging(false);

        const deltaY = currentYRef.current - startYRef.current;

        if (sheetRef.current) {
          if (deltaY > threshold) {
            animateClose();
          } else {
            sheetRef.current.style.transform = 'translate(-50%, 0)';
            sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
          }
        }

        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      // 모바일 터치 이벤트 리스너 등록
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
        capture: true,
      });
      document.addEventListener('touchend', handleTouchEnd, {
        capture: true,
      });
    },
    [threshold, animateClose, isDragging]
  );

  // 정리
  useEffect(() => {
    return () => {
      if (sheetRef.current) {
        sheetRef.current.style.transition = '';
        sheetRef.current.style.transform = '';
      }
    };
  }, []);

  return {
    sheetRef,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    closeWithAnimation: animateClose,
  };
};
