// object-fit: cover 좌표 보정 유틸
// - 원본 이미지 크기 → 렌더 컨테이너 크기 매핑 파라미터 계산
// - 바운딩 박스 중심을 컨테이너 좌표로 투영

export type Size = { width: number; height: number };
// cover 파라미터 타입을 재사용하기 위한 명시적 정의
export type CoverParams = {
  scaleCover: number;
  cropOffsetX: number;
  cropOffsetY: number;
};
// 투영된 중심 좌표 반환 타입
export type ProjectedCenter = { cx: number; cy: number };

// cover 스케일과 잘림 오프셋 계산
/**
 * object-fit: cover 변환 시 필요한 스케일(scale)과 잘림 오프셋(crop offset)을 계산
 * @param image 원본 이미지 크기(original image size)
 * @param container 렌더 컨테이너 크기(rendered container size)
 * @returns cover 파라미터(CoverParams)
 */
export function computeCoverParams(image: Size, container: Size): CoverParams {
  const { width: natW, height: natH } = image;
  const { width: renderedW, height: renderedH } = container;
  const scaleCover = Math.max(renderedW / natW, renderedH / natH);
  const cropOffsetX = (natW * scaleCover - renderedW) / 2;
  const cropOffsetY = (natH * scaleCover - renderedH) / 2;
  return { scaleCover, cropOffsetX, cropOffsetY };
}

// 중심 좌표를 컨테이너 좌표로 투영
/**
 * 원본 중심 좌표(center)를 컨테이너 좌표계(container coordinate system)로 투영
 * @param center 원본 이미지 중심 좌표(original center coordinates)
 * @param cover cover 파라미터(CoverParams)
 * @param container 렌더 컨테이너 크기(rendered container size)
 * @param opts 좌우 반전 옵션(mirror option)
 * @returns 투영된 중심 좌표(ProjectedCenter)
 */
export function projectCenter(
  center: { cxImg: number; cyImg: number },
  cover: CoverParams,
  container: Size,
  opts?: { mirrored?: boolean }
): ProjectedCenter {
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
/**
 * 값(value)을 최소/최대 범위[min, max]로 한정(clamp)
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
