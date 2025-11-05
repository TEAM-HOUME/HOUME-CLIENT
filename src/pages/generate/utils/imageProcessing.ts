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
    x <= 1.05 &&
    y <= 1.05 &&
    w <= 1.05 &&
    h <= 1.05 &&
    x + w <= 1.05 &&
    y + h <= 1.05;

  if (isNormalized) {
    let realXNorm = x * baseW;
    let realYNorm = y * baseH;
    let realWNorm = w * baseW;
    let realHNorm = h * baseH;

    if (realXNorm < 0) {
      realWNorm += realXNorm;
      realXNorm = 0;
    }
    if (realYNorm < 0) {
      realHNorm += realYNorm;
      realYNorm = 0;
    }

    realWNorm = Math.max(1, Math.min(realWNorm, baseW - realXNorm));
    realHNorm = Math.max(1, Math.min(realHNorm, baseH - realYNorm));

    return {
      x: realXNorm,
      y: realYNorm,
      w: realWNorm,
      h: realHNorm,
    };
  }

  const likelyLetterbox =
    x >= -64 &&
    y >= -64 &&
    x <= 704 &&
    y <= 704 &&
    w <= 704 &&
    h <= 704 &&
    x + w <= 768 &&
    y + h <= 768;

  if (!likelyLetterbox) {
    let absX = x;
    let absY = y;
    let absW = w;
    let absH = h;

    if (absX < 0) {
      absW += absX;
      absX = 0;
    }
    if (absY < 0) {
      absH += absY;
      absY = 0;
    }

    absW = Math.max(1, Math.min(absW, baseW - absX));
    absH = Math.max(1, Math.min(absH, baseH - absY));

    return { x: absX, y: absY, w: absW, h: absH };
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
