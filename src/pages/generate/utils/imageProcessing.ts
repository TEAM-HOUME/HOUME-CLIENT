export async function preprocessImage(
  imageElement: HTMLImageElement,
  targetWidth: number = 640,
  targetHeight: number = 640
): Promise<{
  tensor: Float32Array;
  originalWidth: number;
  originalHeight: number;
  scale: number;
}> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  // CSS나 레이아웃 영향 없이 원본 크기를 기준으로 계산
  const srcW = imageElement.naturalWidth || imageElement.width;
  const srcH = imageElement.naturalHeight || imageElement.height;
  const scale = Math.min(targetWidth / srcW, targetHeight / srcH);
  const scaledWidth = srcW * scale;
  const scaledHeight = srcH * scale;
  const padX = (targetWidth - scaledWidth) / 2;
  const padY = (targetHeight - scaledHeight) / 2;

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
  const baseW = image.naturalWidth || image.width;
  const baseH = image.naturalHeight || image.height;
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
