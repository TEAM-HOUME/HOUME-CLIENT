export function preprocessImage(
  imageElement: HTMLImageElement,
  targetWidth: number = 640,
  targetHeight: number = 640
): {
  tensor: Float32Array;
  originalWidth: number;
  originalHeight: number;
  scale: number;
} {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D 컨텍스트(context) 생성 실패');
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  // 레터박스(letterbox) 파라미터는 getLetterboxParams로 재사용해 중복을 방지
  const { scale, padX, padY } = getLetterboxParams(
    imageElement,
    targetWidth,
    targetHeight
  );
  const srcW = imageElement.naturalWidth || imageElement.width;
  const srcH = imageElement.naturalHeight || imageElement.height;
  const scaledWidth = srcW * scale;
  const scaledHeight = srcH * scale;

  // 빈 영역은 검정색으로 채워 letterbox를 만들도록
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  // 중앙 정렬된 상태로 원본 이미지를 그림
  ctx.drawImage(imageElement, padX, padY, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const { data } = imageData;

  // RGB 세 채널을 Float32Array로 준비
  const floatData = new Float32Array(3 * targetHeight * targetWidth);

  for (let i = 0; i < targetHeight * targetWidth; i++) {
    floatData[i] = data[i * 4] / 255.0; // R(적색) 채널을 0~1로 정규화
    floatData[targetHeight * targetWidth + i] = data[i * 4 + 1] / 255.0; // G(녹색) 채널을 0~1로 정규화
    floatData[2 * targetHeight * targetWidth + i] = data[i * 4 + 2] / 255.0; // B(청색) 채널을 0~1로 정규화
  }

  return {
    tensor: floatData,
    originalWidth: srcW,
    originalHeight: srcH,
    scale,
  };
}

// 640x640 기준 바운딩 박스를 원본 이미지 좌표로 변환
export function toImageSpaceBBox(
  image: HTMLImageElement,
  bbox640: [number, number, number, number]
): { x: number; y: number; w: number; h: number } {
  const [x, y, w, h] = bbox640;
  const baseW = image.naturalWidth || image.width;
  const baseH = image.naturalHeight || image.height;

  const isNormalized =
    x >= 0 &&
    y >= 0 &&
    w >= 0 &&
    h >= 0 &&
    x <= 1.01 &&
    y <= 1.01 &&
    w <= 1.01 &&
    h <= 1.01;

  if (isNormalized) {
    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const normX = clamp01(x);
    const normY = clamp01(y);
    const normW = clamp01(w);
    const normH = clamp01(h);

    const endX = clamp01(normX + normW);
    const endY = clamp01(normY + normH);

    const realXNorm = normX * baseW;
    const realYNorm = normY * baseH;
    const realWNorm = Math.max(1, (endX - normX) * baseW);
    const realHNorm = Math.max(1, (endY - normY) * baseH);

    const clampedX = Math.max(0, Math.min(realXNorm, Math.max(0, baseW - 1)));
    const clampedY = Math.max(0, Math.min(realYNorm, Math.max(0, baseH - 1)));
    const clampedW = Math.max(1, Math.min(realWNorm, baseW - clampedX));
    const clampedH = Math.max(1, Math.min(realHNorm, baseH - clampedY));

    return {
      x: clampedX,
      y: clampedY,
      w: clampedW,
      h: clampedH,
    };
  }

  const { scale: s, padX, padY } = getLetterboxParams(image, 640, 640);
  let realX = (x - padX) / s;
  let realY = (y - padY) / s;
  let realW = w / s;
  let realH = h / s;

  if (realX < 0) {
    realW += realX;
    realX = 0;
  }
  if (realY < 0) {
    realH += realY;
    realY = 0;
  }
  realW = Math.max(1, Math.min(realW, baseW - realX));
  realH = Math.max(1, Math.min(realH, baseH - realY));

  return { x: realX, y: realY, w: realW, h: realH };
}

// 이미지(W×H)를 640×640으로 letterbox한 파라미터를 재구성
export function getLetterboxParams(
  image: HTMLImageElement,
  targetW: number,
  targetH: number
): { scale: number; padX: number; padY: number } {
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  const s = Math.min(targetW / srcW, targetH / srcH);
  const scaledW = srcW * s;
  const scaledH = srcH * s;
  const padX = (targetW - scaledW) / 2;
  const padY = (targetH - scaledH) / 2;
  return { scale: s, padX, padY };
}
