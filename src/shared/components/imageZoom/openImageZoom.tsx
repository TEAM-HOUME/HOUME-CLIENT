import { Suspense, lazy } from 'react';

import { overlay } from 'overlay-kit';

import type { ImageZoomViewerProps } from './ImageZoomViewer';

// 첫 호출 시점에만 로드 → react-zoom-pan-pinch가 호출부 화면의 초기 번들에 안 실린다
const ImageZoomViewer = lazy(() => import('./ImageZoomViewer'));

type OpenImageZoomOptions = Pick<
  ImageZoomViewerProps,
  'src' | 'isMirror' | 'alt'
>;

/**
 * 이미지 확대/축소 라이트박스를 띄운다.
 * 어두운 backdrop 위 세로 중앙 이미지 + 핀치/버튼 확대·축소, backdrop 탭 시 닫힘.
 */
export const openImageZoom = ({ src, isMirror, alt }: OpenImageZoomOptions) =>
  overlay.open(({ unmount }) => (
    <Suspense fallback={null}>
      <ImageZoomViewer
        src={src}
        isMirror={isMirror}
        alt={alt}
        onClose={unmount}
      />
    </Suspense>
  ));
