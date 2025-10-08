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

export function drawDetections(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  detections: any[]
) {
  const ctx = canvas.getContext('2d')!;

  canvas.width = image.width;
  canvas.height = image.height;

  // 먼저 원본 이미지를 그림
  ctx.drawImage(image, 0, 0);

  // Letterbox(640x640) → 원본 좌표계 복구 파라미터
  const { scale: s, padX, padY } = getLetterboxParams(image, 640, 640);

  detections.forEach((detection) => {
    const [x, y, w, h] = detection.bbox;
    // 640x640 좌표계에서 padding 제거 후 1/s로 되돌림
    let realX = (x - padX) / s;
    let realY = (y - padY) / s;
    let realW = w / s;
    let realH = h / s;

    // 경계 보정
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

    // 바운딩 박스 그리기
    ctx.strokeStyle = getColorForClass(detection.label);
    ctx.lineWidth = 3;
    ctx.strokeRect(realX, realY, realW, realH);

    // 라벨 배경 그리기
    ctx.fillStyle = getColorForClass(detection.label);
    ctx.font = 'bold 16px Arial';
    const text = `${detection.className} ${(detection.score * 100).toFixed(1)}%`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = 25;

    // 라벨이 화면 밖으로 나가지 않도록 위치 조정
    const labelY = realY > textHeight ? realY - textHeight : realY + realH;

    ctx.fillRect(realX, labelY, textWidth + 10, textHeight);

    // 라벨 텍스트 그리기
    ctx.fillStyle = 'white';
    ctx.fillText(text, realX + 5, labelY + 18);
  });
}

function getColorForClass(classId: number): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8B739',
    '#52C777',
    '#FF7F50',
    '#6495ED',
    '#FFD700',
    '#FF69B4',
    '#00CED1',
  ];
  return colors[classId % colors.length];
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

// 감지 영역을 크롭하여 Blob으로 반환 (JPEG)
export async function cropDetectionToBlob(
  image: HTMLImageElement,
  bbox640: [number, number, number, number],
  options?: { quality?: number; maxSize?: number }
): Promise<Blob> {
  const { x, y, w, h } = toImageSpaceBBox(image, bbox640);
  const off = document.createElement('canvas');
  const ctx = off.getContext('2d')!;
  off.width = Math.max(1, Math.round(w));
  off.height = Math.max(1, Math.round(h));
  ctx.drawImage(image, x, y, w, h, 0, 0, off.width, off.height);

  // 필요 시 최대 크기로 리사이즈
  const maxSize = options?.maxSize ?? 640;
  if (Math.max(off.width, off.height) > maxSize) {
    const scale = maxSize / Math.max(off.width, off.height);
    const resized = document.createElement('canvas');
    const rctx = resized.getContext('2d')!;
    resized.width = Math.round(off.width * scale);
    resized.height = Math.round(off.height * scale);
    rctx.drawImage(off, 0, 0, resized.width, resized.height);
    return await new Promise<Blob>((resolve, reject) => {
      resized.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        options?.quality ?? 0.92
      );
    });
  }

  return await new Promise<Blob>((resolve, reject) => {
    off.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      options?.quality ?? 0.92
    );
  });
}

// 이미지(W×H)를 640×640으로 letterbox한 파라미터를 재구성
function getLetterboxParams(
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
