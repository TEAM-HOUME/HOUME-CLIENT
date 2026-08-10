import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import OptimizedImage from '@components/image/OptimizedImage';

import * as styles from './ImageZoomViewer.css';

// TransformComponent 래퍼/콘텐츠를 프레임 전체로 → 뷰어(뷰포트) 자체가 확대되는 방식
const FILL_STYLE = { width: '100%', height: '100%' } as const;

// 탭 vs 드래그(팬) 판별 임계값(px)
const TAP_MOVE_THRESHOLD = 10;

export interface ImageZoomViewerProps {
  /** 확대해서 볼 이미지 원본 URL */
  src: string;
  /** 좌우 반전 여부 (결과 이미지의 isMirror) */
  isMirror?: boolean;
  alt?: string;
  /** backdrop 탭 시 호출 (overlay unmount) */
  onClose: () => void;
}

/**
 * 이미지 확대/축소 라이트박스 (뷰어/뷰포트 확대 방식).
 * - 앱 프레임 전체가 확대 뷰포트 → 확대하면 이미지가 화면에서 실제로 더 커진다
 * - 핀치/더블탭/휠로 확대·축소, 드래그로 팬(경계에서 하드 스톱)
 * - 이미지 밖 어두운 여백 탭 시 닫힘
 *
 * overlay.open으로 띄우며 onClose에 unmount를 연결한다. ([[openImageZoom]])
 */
const ImageZoomViewer = ({
  src,
  isMirror = false,
  alt = '',
  onClose,
}: ImageZoomViewerProps) => {
  const [motion, setMotion] = useState<'opening' | 'open'>('opening');
  const dialogRef = useRef<HTMLDivElement>(null);

  // 첫 프레임 hidden → rAF×2 후 open (enter fade 트리거) — v2 Popup과 동일 패턴
  useLayoutEffect(() => {
    let raf2: number | null = null;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMotion('open'));
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, []);

  // 열려 있는 동안 body 스크롤 잠금 + dialog로 포커스 이동, 닫힐 때 이전 값·포커스 복원
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape로 닫기 (키보드 접근성)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 이미지 밖 어두운 여백(stage 배경) 탭 시 닫힘 — 이미지 위 탭/제스처는 유지
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const handleStagePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleStageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // 이미지·버튼이 아닌 여백만
    const start = pointerDownRef.current;
    if (start) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved > TAP_MOVE_THRESHOLD) return; // 팬(드래그)이면 닫지 않음
    }
    onClose();
  };

  return (
    <div className={styles.viewportLayer}>
      <div className={styles.backdrop({ motion })} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={styles.content({ motion })}
        role="dialog"
        aria-modal="true"
        aria-label="이미지 확대 보기"
        tabIndex={-1}
      >
        {/* 하드 스톱 팬(limitToBounds+disablePadding) + 래퍼/콘텐츠를 프레임 전체로 늘려(FILL_STYLE) 이미지 뷰어 자체가 확대되도록 한다 */}
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          limitToBounds
          disablePadding
          doubleClick={{ mode: 'toggle' }}
        >
          <TransformComponent
            wrapperClass={styles.zoomWrapper}
            wrapperStyle={FILL_STYLE}
            contentStyle={FILL_STYLE}
          >
            <div
              className={styles.imageStage}
              onPointerDown={handleStagePointerDown}
              onClick={handleStageClick}
            >
              <OptimizedImage
                src={src}
                alt={alt}
                loading="eager"
                decoding="async"
                draggable={false}
                className={styles.image({ mirrored: isMirror })}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};

export default ImageZoomViewer;
