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

  const scale = Math.min(
    targetWidth / imageElement.width,
    targetHeight / imageElement.height
  );
  const scaledWidth = imageElement.width * scale;
  const scaledHeight = imageElement.height * scale;
  const padX = (targetWidth - scaledWidth) / 2;
  const padY = (targetHeight - scaledHeight) / 2;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(imageElement, padX, padY, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const { data } = imageData;

  const floatData = new Float32Array(3 * targetHeight * targetWidth);

  for (let i = 0; i < targetHeight * targetWidth; i++) {
    floatData[i] = data[i * 4] / 255.0; // R
    floatData[targetHeight * targetWidth + i] = data[i * 4 + 1] / 255.0; // G
    floatData[2 * targetHeight * targetWidth + i] = data[i * 4 + 2] / 255.0; // B
  }

  return {
    tensor: floatData,
    originalWidth: imageElement.width,
    originalHeight: imageElement.height,
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
  realW = Math.max(1, Math.min(realW, image.width - realX));
  realH = Math.max(1, Math.min(realH, image.height - realY));

  return { x: realX, y: realY, w: realW, h: realH };
}

// 이미지(W×H)를 640×640으로 letterbox한 파라미터를 재구성
export function getLetterboxParams(
  image: HTMLImageElement,
  targetW: number,
  targetH: number
): { scale: number; padX: number; padY: number } {
  const s = Math.min(targetW / image.width, targetH / image.height);
  const scaledW = image.width * s;
  const scaledH = image.height * s;
  const padX = (targetW - scaledW) / 2;
  const padY = (targetH - scaledH) / 2;
  return { scale: s, padX, padY };
}
