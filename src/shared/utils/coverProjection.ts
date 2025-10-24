// object-fit: cover 좌표 보정 유틸
// - 원본 이미지 크기 → 렌더 컨테이너 크기 매핑 파라미터 계산
// - 바운딩 박스 중심을 컨테이너 좌표로 투영

export type Size = { width: number; height: number };

// cover 스케일과 잘림 오프셋 계산
export function computeCoverParams(image: Size, container: Size) {
  const { width: natW, height: natH } = image;
  const { width: renderedW, height: renderedH } = container;
  const scaleCover = Math.max(renderedW / natW, renderedH / natH);
  const cropOffsetX = (natW * scaleCover - renderedW) / 2;
  const cropOffsetY = (natH * scaleCover - renderedH) / 2;
  return { scaleCover, cropOffsetX, cropOffsetY };
}

// 중심 좌표를 컨테이너 좌표로 투영
export function projectCenter(
  center: { cxImg: number; cyImg: number },
  cover: { scaleCover: number; cropOffsetX: number; cropOffsetY: number },
  container: Size,
  opts?: { mirrored?: boolean }
) {
  const { cxImg, cyImg } = center;
  const { scaleCover, cropOffsetX, cropOffsetY } = cover;
  const { width: renderedW, height: renderedH } = container;
  let cx = cxImg * scaleCover - cropOffsetX;
  let cy = cyImg * scaleCover - cropOffsetY;
  if (opts?.mirrored) cx = renderedW - cx; // 좌우 반전 옵션
  cx = clamp(cx, 0, renderedW);
  cy = clamp(cy, 0, renderedH);
  return { cx, cy };
}

// 수치 보정
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
