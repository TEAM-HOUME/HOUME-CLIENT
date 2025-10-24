import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 가구 핫스팟 생성 파이프라인 설명
// - Obj365 추론 → 가구만 선별(useOnnxModel에서 처리) → Cabinet/Shelf만 추가 리파인 → 가구 전체 핫스팟 렌더
// - 라벨 규약: 모델 1‑based → 내부 0‑based로 정규화하여 통일(useOnnxModel에서 처리)
// - Fallback candidates 설명
//   - 목적: 임계값 필터 결과가 0개일 때 빈 화면 회피
//   - 시점: cabinet confidence 와 비‑cabinet score 가 모두 임계 미만일 때 동작
//   - 기준: cabinet은 refine confidence, 그 외는 모델 score 사용
//   - 방식: 신뢰도/점수 상위 K개만 노출, K는 FALLBACK_MAX_CANDIDATES

import {
  OBJ365_MODEL_PATH,
  DETECTION_MIN_CONFIDENCE,
  FALLBACK_MAX_CANDIDATES,
} from '@pages/generate/constants/detection';
import { useONNXModel } from '@pages/generate/hooks/useOnnxModel';
import { toImageSpaceBBox } from '@pages/generate/utils/imageProcessing';
import { isCabinetShelfIndex } from '@pages/generate/utils/obj365Furniture';
import {
  refineFurnitureDetections,
  type Detection as RawDetection,
} from '@pages/generate/utils/refineFurnitureDetections';
import {
  computeCoverParams,
  projectCenter,
} from '@shared/utils/coverProjection';

import type { ProcessedDetections } from '@pages/generate/types/detection';

// 핫스팟 타입(가구 전반 + Cabinet 리파인 결과 통합)
export type FurnitureHotspot = RawDetection & {
  id: number;
  cx: number;
  cy: number;
  refinedLabel?: import('@pages/generate/utils/furnitureCategories').FurnitureCategory;
  refinedKoLabel?: string;
  confidence?: number; // cabinet은 refine confidence, 기타는 score를 사용
};

async function loadCorsImage(url: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = objUrl;
    });
    URL.revokeObjectURL(objUrl);
    return img;
  } catch {
    return null;
  }
}

// 가구 전반 핫스팟 훅
// - 1) 모델 추론(가구만) 2) cabinet만 리파인 3) 임계값 필터/폴백 4) 좌표 보정
export function useFurnitureHotspots(imageUrl: string, mirrored = false) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hotspots, setHotspots] = useState<FurnitureHotspot[]>([]);
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const { runInference, isLoading, error } = useONNXModel(OBJ365_MODEL_PATH);

  const processDetections = useCallback(
    (imageEl: HTMLImageElement, inference: ProcessedDetections) => {
      const natW = imageEl.naturalWidth || imageEl.width;
      const natH = imageEl.naturalHeight || imageEl.height;
      const pixelDetections: RawDetection[] = inference.detections.map(
        (det) => {
          const { x, y, w, h } = toImageSpaceBBox(imageEl, det.bbox);
          return {
            ...det,
            bbox: [x, y, w, h] as [number, number, number, number],
          };
        }
      );
      setImageMeta({ width: natW, height: natH });

      if (pixelDetections.length === 0) {
        setHotspots([]);
        return;
      }

      // cabinet / others 분리
      // - cabinet은 세분 리파인 대상
      // - 그 외 가구는 점수 기반으로 그대로 사용
      const cabinet = pixelDetections.filter((d) =>
        isCabinetShelfIndex(d.label as number)
      );
      const others = pixelDetections.filter(
        (d) => !isCabinetShelfIndex(d.label as number)
      );

      // cabinet 리파인
      const { refinedDetections } = cabinet.length
        ? refineFurnitureDetections(cabinet, { width: natW, height: natH })
        : ({ refinedDetections: [] } as any);

      // 통합 배열 구성
      // - cabinet은 refine 결과 사용(confidence/라벨 보강)
      // - others는 원시 감지 사용(score 유지)
      const combined: FurnitureHotspot[] = [
        ...refinedDetections.map((det, idx) => ({
          id: idx,
          bbox: det.bbox,
          score: det.score,
          label: det.label,
          refinedLabel: det.refinedLabel,
          refinedKoLabel: det.refinedKoLabel,
          confidence: det.confidence, // 리파인 신뢰도 사용
          cx: 0,
          cy: 0,
        })),
        ...others.map((det, i) => ({
          id: refinedDetections.length + i,
          bbox: det.bbox,
          score: det.score,
          label: det.label,
          // cabinet이 아니므로 리파인 라벨/신뢰도 없음
          confidence: det.score, // 임계값 판단을 위해 score 사용
          cx: 0,
          cy: 0,
        })),
      ];

      // 임계값 필터 + 폴백
      // - 임계값 통과 항목이 없으면 상위 K개를 폴백으로 노출
      // - cabinet은 confidence, others는 score 값을 사용
      const pass = combined.filter(
        (d) => (d.confidence ?? d.score ?? 0) >= DETECTION_MIN_CONFIDENCE
      );
      const effective =
        pass.length > 0
          ? pass
          : [...combined]
              .sort(
                (a, b) =>
                  (b.confidence ?? b.score ?? 0) -
                  (a.confidence ?? a.score ?? 0)
              )
              .slice(0, Math.min(FALLBACK_MAX_CANDIDATES, combined.length));

      setHotspots(effective);
    },
    []
  );

  const run = useCallback(async () => {
    if (!imgRef.current || !containerRef.current) return;
    try {
      const imageEl = imgRef.current;
      const result = await runInference(imageEl);
      processDetections(imageEl, result);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        const corsImg = await loadCorsImage(imageUrl);
        if (corsImg) {
          try {
            const result = await runInference(corsImg);
            if (imgRef.current) processDetections(imgRef.current, result);
            return;
          } catch {
            // ignore
          }
        }
      }
      setHotspots([]);
    }
  }, [processDetections, runInference, imageUrl]);

  // 이미지 onload
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => run();
    if (img.complete) run();
    else img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, [imageUrl, run]);

  // 컨테이너 크기 관찰
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      setContainerSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h }
      );
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => update());
      observer.observe(container);
      return () => observer.disconnect();
    }
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 좌표 보정
  const renderedHotspots = useMemo(() => {
    if (!imageMeta || containerSize.width === 0 || containerSize.height === 0)
      return [] as FurnitureHotspot[];
    const cover = computeCoverParams(imageMeta, containerSize);
    return hotspots.map((det) => {
      const [x, y, w, h] = det.bbox;
      const { cx, cy } = projectCenter(
        { cxImg: x + w / 2, cyImg: y + h / 2 },
        cover,
        containerSize,
        { mirrored }
      );
      return { ...det, cx, cy };
    });
  }, [hotspots, imageMeta, containerSize, mirrored]);

  return {
    imgRef,
    containerRef,
    hotspots: renderedHotspots,
    isLoading,
    error,
  } as const;
}
