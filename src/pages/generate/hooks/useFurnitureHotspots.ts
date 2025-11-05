import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 가구 핫스팟 생성 파이프라인 설명
// - Obj365 추론 → 가구만 선별(useOnnxModel에서 처리) → Cabinet/Shelf만 추가 리파인 → 가구 전체 핫스팟 렌더
// - 라벨 규약: 모델 1‑based → 내부 0‑based로 정규화하여 통일(useOnnxModel에서 처리)
// - Fallback candidates 설명
//   - 목적: 임계값 필터 결과가 0개일 때 빈 화면 회피
//   - 시점: cabinet confidence 또는 비‑cabinet score 기반 랭크 점수가 모두 임계 미만일 때 동작
//   - 기준: cabinet은 refine confidence, 그 외는 모델 score 사용(단일 랭크 스코어로 비교)
//   - 방식: 신뢰도/점수 상위 K개만 노출, K는 FALLBACK_MAX_CANDIDATES

import {
  OBJ365_MODEL_PATH,
  DETECTION_MIN_CONFIDENCE,
  FALLBACK_MAX_CANDIDATES,
} from '@pages/generate/constants/detection';
import { useONNXModel } from '@pages/generate/hooks/useOnnxModel';
import { toImageSpaceBBox } from '@pages/generate/utils/imageProcessing';
import { OBJ365_ALL_CLASSES } from '@pages/generate/utils/obj365AllClasses';
import { isCabinetShelfIndex } from '@pages/generate/utils/obj365Furniture';
import {
  refineFurnitureDetections,
  type FurnitureCategory,
  type RefinedFurnitureDetection,
} from '@pages/generate/utils/refineFurnitureDetections';

import type {
  Detection as FurnitureDetection,
  ProcessedDetections,
} from '@pages/generate/types/detection';

/**
 * 가구 핫스팟(FurnitureHotspot)
 * - 대상: 원시 감지(FurnitureDetection) + cabinet 리파인 결과
 * - 목적: 렌더 계층에서 좌표(cx, cy)와 ID, 리파인 정보를 한 번에 소비하도록 통합
 */
export type FurnitureHotspot = FurnitureDetection & {
  id: number;
  cx: number;
  cy: number;
  refinedLabel?: FurnitureCategory;
  refinedKoLabel?: string;
  confidence?: number; // cabinet 리파인 결과에서만 노출되는 신뢰도
};

// ID 생성 시 bbox 좌표 정규화를 위한 소수점 자릿수
const HOTSPOT_ID_PRECISION = 3;
const MIN_BBOX_PIXELS = 8;

type RenderMetrics = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
};

const formatKeyPart = (value: number) =>
  Number.isFinite(value) ? value.toFixed(HOTSPOT_ID_PRECISION) : 'NaN';

/**
 * 문자열 해시 함수(hashString)
 * - 목적: 디텍션 고유 값 조합을 32비트 정수로 압축해 안정적인 key로 사용
 * - 설명: 단순 다항 해시(Polynomial rolling hash)로, 동일 입력에 항상 동일 ID가 생성
 */
const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
};

/**
 * 랭크 점수 계산(computeRankScore)
 * - cabinet: 리파인 confidence를 사용
 * - 기타 가구: 모델 score를 그대로 사용
 * - 목적: 임계값 필터링과 폴백 정렬을 단일 수치 기준으로 수행
 */
const computeRankScore = (candidate: { confidence?: number; score?: number }) =>
  candidate.confidence ?? candidate.score ?? 0;

/**
 * 핫스팟 ID 생성(createHotspotId)
 * - bbox/label/refinedLabel/score를 결합하여 해시
 * - 설명: 인덱스 기반 ID로 발생하던 키 변동 문제(렌더 재생성)를 차단
 */
const createHotspotId = (input: {
  bbox: [number, number, number, number];
  label?: number;
  refinedLabel?: string;
  confidence?: number;
  score?: number;
}) => {
  const identity = [
    input.label ?? 'none',
    input.refinedLabel ?? 'none',
    ...input.bbox.map((value) => formatKeyPart(value)),
    formatKeyPart(input.confidence ?? input.score ?? 0),
  ].join('|');
  return hashString(identity);
};

/**
 * 핫스팟 배열 비교(areHotspotsEqual)
 * - 목적: 상태값이 실질적으로 동일할 때 setState를 생략해 리렌더를 방지
 */
const areHotspotsEqual = (
  prev: FurnitureHotspot[],
  next: FurnitureHotspot[]
) => {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    const prevHotspot = prev[i];
    const nextHotspot = next[i];
    if (
      prevHotspot.id !== nextHotspot.id ||
      prevHotspot.score !== nextHotspot.score ||
      prevHotspot.confidence !== nextHotspot.confidence ||
      prevHotspot.refinedLabel !== nextHotspot.refinedLabel ||
      prevHotspot.refinedKoLabel !== nextHotspot.refinedKoLabel
    ) {
      return false;
    }
  }
  return true;
};

/**
 * 폴백 포함 유효 핫스팟 선택(selectEffectiveHotspots)
 * - 1차: 임계값 이상 항목만 반환
 * - 2차: 모두 미달 시 상위 K개만 노출하여 빈 결과를 방지
 */
const selectEffectiveHotspots = (candidates: FurnitureHotspot[]) => {
  const passing = candidates.filter(
    (candidate) => computeRankScore(candidate) >= DETECTION_MIN_CONFIDENCE
  );
  if (passing.length > 0) return passing;
  return [...candidates]
    .sort((a, b) => computeRankScore(b) - computeRankScore(a))
    .slice(0, Math.min(FALLBACK_MAX_CANDIDATES, candidates.length));
};

/**
 * Refine 결과 판별(isRefinedDetection)
 * - 목적: type guard로서 리파인 필드 접근 시 타입 안전성 확보
 */
const isRefinedDetection = (
  detection: FurnitureDetection | RefinedFurnitureDetection
): detection is RefinedFurnitureDetection =>
  'refinedLabel' in detection && 'confidence' in detection;

/**
 * 디텍션을 핫스팟 도메인 모델로 변환(createHotspotFromDetection)
 * - 역할: 좌표/라벨/점수를 유지하면서 안정 ID 부여 및 좌표(cx, cy) 초기화
 */
const createHotspotFromDetection = (
  detection: FurnitureDetection | RefinedFurnitureDetection
): FurnitureHotspot => {
  const refinedLabel = isRefinedDetection(detection)
    ? detection.refinedLabel
    : undefined;
  const refinedKoLabel = isRefinedDetection(detection)
    ? detection.refinedKoLabel
    : undefined;
  const confidence = isRefinedDetection(detection)
    ? detection.confidence
    : undefined;

  return {
    bbox: detection.bbox,
    score: detection.score,
    label: detection.label,
    className: detection.className,
    refinedLabel,
    refinedKoLabel,
    confidence,
    id: createHotspotId({
      bbox: detection.bbox,
      label: detection.label,
      refinedLabel,
      confidence,
      score: detection.score,
    }),
    cx: 0,
    cy: 0,
  };
};

/**
 * CORS 이미지 로더(loadCorsImage)
 * - 목적: SecurityError 발생 시 크로스 도메인 이미지를 우회 로딩
 * - signal: 중복 요청이나 컴포넌트 언마운트 시 취소(abort) 지원
 */
async function loadCorsImage(
  url: string,
  signal?: AbortSignal
): Promise<HTMLImageElement | null> {
  let objectUrl: string | null = null;
  try {
    const res = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      signal,
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        resolve();
      };
      img.onerror = (e) => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        reject(e);
      };
      img.src = objectUrl!;
    });
    return img;
  } catch (error) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      console.warn('[useFurnitureHotspots] cors image load failed', error);
    }
    return null;
  }
}

// 가구 전반 핫스팟 훅
// - 1) 모델 추론(가구만) 2) cabinet만 리파인 3) 임계값 필터/폴백 4) 좌표 보정
export function useFurnitureHotspots(
  imageUrl: string,
  mirrored = false,
  enabled = true
) {
  /**
   * useFurnitureHotspots
   * - 입력: 이미지 URL + 좌우반전 여부
   * - 동작:
   *   1. Obj365 모델 추론(runInference)
   *   2. cabinet 감지만 리파인(refineFurnitureDetections)
   *   3. 임계값/폴백 기반 후보 선택(selectEffectiveHotspots)
   *   4. coverProjection으로 좌표(cx, cy) 투영
   * - 출력: 이미지/컨테이너 ref, 렌더링용 핫스팟, 로딩/에러 상태
   */
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const corsAbortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const hasRunRef = useRef(false);

  const [hotspots, setHotspots] = useState<FurnitureHotspot[]>([]);
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [renderMetrics, setRenderMetrics] = useState<RenderMetrics | null>(
    null
  );

  const { runInference, isLoading, error } = useONNXModel(OBJ365_MODEL_PATH);

  const measureRenderMetrics = useCallback(() => {
    const imgEl = imgRef.current;
    const containerEl = containerRef.current;
    if (!imgEl || !containerEl) return null;
    const imgRect = imgEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const naturalWidth = imgEl.naturalWidth || imgEl.width;
    const naturalHeight = imgEl.naturalHeight || imgEl.height;
    if (
      !naturalWidth ||
      !naturalHeight ||
      imgRect.width === 0 ||
      imgRect.height === 0
    ) {
      return null;
    }
    const metrics: RenderMetrics = {
      offsetX: imgRect.left - containerRect.left,
      offsetY: imgRect.top - containerRect.top,
      scaleX: imgRect.width / naturalWidth,
      scaleY: imgRect.height / naturalHeight,
      width: imgRect.width,
      height: imgRect.height,
    };
    setRenderMetrics(metrics);
    return metrics;
  }, []);

  const processDetections = useCallback(
    (imageEl: HTMLImageElement, inference: ProcessedDetections) => {
      /**
       * processDetections
       * - 픽셀 좌표 변환 → cabinet 리파인 → 안정 ID 부여 → 임계값/폴백 적용
       * - 설명: setState 최소화를 위해 이전 상태와 비교 후 변경 시에만 갱신
       */
      const natW = imageEl.naturalWidth || imageEl.width;
      const natH = imageEl.naturalHeight || imageEl.height;

      console.info('[useFurnitureHotspots] 원시 감지(raw detections)', {
        imageUrl,
        mirrored,
        total: inference.detections.length,
        samples: inference.detections.slice(0, 5),
      });

      const pixelDetections: FurnitureDetection[] = inference.detections.map(
        (det) => {
          const { x, y, w, h } = toImageSpaceBBox(imageEl, det.bbox);
          return {
            ...det,
            bbox: [x, y, w, h] as [number, number, number, number],
          };
        }
      );
      setImageMeta({ width: natW, height: natH });

      console.info('[useFurnitureHotspots] 픽셀 변환 감지(pixel detections)', {
        imageUrl,
        mirrored,
        total: pixelDetections.length,
        samples: pixelDetections.slice(0, 5).map((det) => ({
          id: det.label ?? null,
          bbox: det.bbox,
          score: det.score,
          className: det.className ?? null,
        })),
      });

      if (pixelDetections.length === 0) {
        setHotspots((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      const cabinet = pixelDetections.filter((d) => {
        if (!isCabinetShelfIndex(d.label)) return false;
        const [, , w, h] = d.bbox;
        return w >= MIN_BBOX_PIXELS && h >= MIN_BBOX_PIXELS;
      });
      const others = pixelDetections.filter(
        (d) => !isCabinetShelfIndex(d.label)
      );

      const { refinedDetections } = cabinet.length
        ? refineFurnitureDetections(cabinet, { width: natW, height: natH })
        : { refinedDetections: [] as RefinedFurnitureDetection[] };

      if (refinedDetections.length > 0) {
        console.info('[useFurnitureHotspots] 리파인 감지(refined detections)', {
          imageUrl,
          mirrored,
          total: refinedDetections.length,
          samples: refinedDetections.slice(0, 5).map((det) => ({
            id: det.label ?? null,
            refinedLabel: det.refinedLabel ?? null,
            confidence: det.confidence ?? null,
            bbox: det.bbox,
          })),
        });
      }

      const combinedDetections: Array<
        FurnitureDetection | RefinedFurnitureDetection
      > = [...refinedDetections, ...others];
      const hotspotCandidates = combinedDetections.map((det) =>
        createHotspotFromDetection(det)
      );
      const debugItems = hotspotCandidates.map((candidate) => {
        const labelIndex = candidate.label ?? null;
        const baseClass =
          labelIndex !== null && OBJ365_ALL_CLASSES[labelIndex]
            ? OBJ365_ALL_CLASSES[labelIndex]
            : null;
        return {
          id: candidate.id,
          labelKo: candidate.refinedKoLabel ?? null,
          labelEn: candidate.className ?? baseClass,
          score: candidate.score ?? null,
          confidence: candidate.confidence ?? null,
          bbox: candidate.bbox,
        };
      });
      console.info('[useFurnitureHotspots] 추론 결과(inference result)', {
        imageUrl,
        total: hotspotCandidates.length,
        items: debugItems,
      });
      const effective = hotspotCandidates.length
        ? selectEffectiveHotspots(hotspotCandidates)
        : [];

      setHotspots((prev) =>
        areHotspotsEqual(prev, effective) ? prev : effective
      );
    },
    []
  );

  const run = useCallback(async () => {
    /**
     * run
     * - 역할: 원본 이미지 추론을 수행하고, 실패 시 CORS 재시도를 트리거
     * - 예외 처리: Abort/SecurityError 이외에는 경고 로그를 남겨 디버깅 용이성 확보
     */
    if (!enabled) {
      setHotspots((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    // 모델 로딩 또는 에러 상태면 추론 실행 보류
    if (isLoading || error) return;
    if (!imgRef.current || !containerRef.current) return;
    if (hasRunRef.current) return;
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    try {
      const imageEl = imgRef.current;
      const naturalWidth = imageEl.naturalWidth || imageEl.width;
      const naturalHeight = imageEl.naturalHeight || imageEl.height;
      console.info('[useFurnitureHotspots] 추론 시작(inference start)', {
        imageUrl,
        naturalWidth,
        naturalHeight,
        mirrored,
      });
      measureRenderMetrics();
      const result = await runInference(imageEl);
      processDetections(imageEl, result);
      hasRunRef.current = true;
    } catch (error) {
      if (error instanceof Error) {
        console.warn('[useFurnitureHotspots] inference failed detail', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      if (error instanceof DOMException && error.name === 'SecurityError') {
        corsAbortRef.current?.abort();
        const controller = new AbortController();
        corsAbortRef.current = controller;
        try {
          const corsImg = await loadCorsImage(imageUrl, controller.signal);
          if (corsImg) {
            try {
              const naturalWidth = corsImg.naturalWidth || corsImg.width;
              const naturalHeight = corsImg.naturalHeight || corsImg.height;
              console.info(
                '[useFurnitureHotspots] CORS 추론 시작(cors inference start)',
                {
                  imageUrl,
                  naturalWidth,
                  naturalHeight,
                  mirrored,
                }
              );
              const result = await runInference(corsImg);
              const targetEl = imgRef.current ?? corsImg;
              processDetections(targetEl, result);
              hasRunRef.current = true;
              return;
            } catch (retryError) {
              if (
                !(
                  retryError instanceof DOMException &&
                  retryError.name === 'AbortError'
                )
              ) {
                console.warn(
                  '[useFurnitureHotspots] inference retry failed',
                  retryError
                );
              }
            }
          } else {
            console.warn(
              '[useFurnitureHotspots] cors image unavailable, falling back to empty hotspots'
            );
          }
        } catch (retrySetupError) {
          if (
            !(
              retrySetupError instanceof DOMException &&
              retrySetupError.name === 'AbortError'
            )
          ) {
            console.warn(
              '[useFurnitureHotspots] cors retry setup failed',
              retrySetupError
            );
          }
        } finally {
          corsAbortRef.current = null;
        }
      } else if (
        !(error instanceof DOMException && error.name === 'AbortError')
      ) {
        console.warn('[useFurnitureHotspots] inference failed', error);
      }
      setHotspots((prev) => (prev.length === 0 ? prev : []));
    } finally {
      isRunningRef.current = false;
      corsAbortRef.current = null;
    }
  }, [
    processDetections,
    runInference,
    imageUrl,
    isLoading,
    error,
    mirrored,
    enabled,
  ]);

  // 이미지 onload
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    // 모델 준비 이후에만 이미지 onload 콜백 등록
    if (isLoading || error || !enabled) return;
    const onLoad = () => {
      measureRenderMetrics();
      if (hasRunRef.current) return;
      run();
    };
    if (img.complete) {
      measureRenderMetrics();
      if (!hasRunRef.current) run();
    } else {
      img.addEventListener('load', onLoad);
    }
    return () => img.removeEventListener('load', onLoad);
  }, [imageUrl, run, isLoading, error, enabled, measureRenderMetrics]);

  useEffect(
    () => () => {
      corsAbortRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    hasRunRef.current = false;
    setRenderMetrics(null);
  }, [imageUrl, mirrored]);

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

  useEffect(() => {
    if (!enabled) return;
    const raf = requestAnimationFrame(() => {
      measureRenderMetrics();
    });
    return () => cancelAnimationFrame(raf);
  }, [
    enabled,
    measureRenderMetrics,
    containerSize.width,
    containerSize.height,
  ]);

  // 좌표 보정
  const renderedHotspots = useMemo(() => {
    if (!renderMetrics || !imageMeta) return [] as FurnitureHotspot[];
    const {
      offsetX,
      offsetY,
      scaleX,
      scaleY,
      width: renderW,
      height: renderH,
    } = renderMetrics;
    if (scaleX === 0 || scaleY === 0) return [] as FurnitureHotspot[];

    const containerW = containerSize.width || renderW;
    const containerH = containerSize.height || renderH;

    const projected = hotspots.map((det) => {
      const [x, y, w, h] = det.bbox;
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      let cx = offsetX + centerX * scaleX;
      if (mirrored) {
        cx = offsetX + renderW - centerX * scaleX;
      }
      const cy = offsetY + centerY * scaleY;
      const clampedCx = Math.min(containerW, Math.max(0, cx));
      const clampedCy = Math.min(containerH, Math.max(0, cy));
      return { ...det, cx: clampedCx, cy: clampedCy };
    });
    if (projected.length > 0) {
      console.info('[useFurnitureHotspots] 좌표 보정(projected hotspots)', {
        imageUrl,
        mirrored,
        containerSize,
        imageMeta,
        renderMetrics,
        samples: projected.slice(0, 5).map((item) => ({
          id: item.id,
          cx: item.cx,
          cy: item.cy,
          bbox: item.bbox,
        })),
      });
    }
    return projected;
  }, [hotspots, imageMeta, containerSize, mirrored, renderMetrics, imageUrl]);

  return {
    imgRef,
    containerRef,
    hotspots: renderedHotspots,
    isLoading,
    error,
  } as const;
}
