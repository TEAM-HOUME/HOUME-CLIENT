import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

// 가구 핫스팟 생성 파이프라인 설명
// - Obj365 추론 → 가구만 선별(useOnnxModel에서 처리) → Cabinet/Shelf만 추가 리파인 → 가구 전체 핫스팟 렌더
// - 라벨 규약: 모델 1‑based → 내부 0‑based로 정규화하여 통일(useOnnxModel에서 처리)
// - Fallback candidates 설명
//   - 목적: 임계값 필터 결과가 0개일 때 빈 화면 회피
//   - 시점: cabinet confidence 또는 비‑cabinet score 기반 랭크 점수가 모두 임계 미만일 때 동작
//   - 기준: cabinet은 refine confidence, 그 외는 모델 score 사용(단일 랭크 스코어로 비교)
//   - 방식: 신뢰도/점수 상위 K개만 노출, K는 FALLBACK_MAX_CANDIDATES

import { OBJ365_MODEL_PATH } from '@pages/generate/constants/detection';
import { useONNXModel } from '@pages/generate/hooks/useOnnxModel';
import {
  logFurniturePipelineEvent,
  reportFurniturePipelineWarning,
} from '@pages/generate/utils/furniturePipelineMonitor';

import {
  buildHotspotsPipeline,
  computeRenderMetrics,
  projectHotspots,
} from './furnitureHotspotPipeline';
import {
  createLoggedPipelineDispatch,
  furnitureHotspotInitialState,
  furnitureHotspotReducer,
} from './furnitureHotspotState';

import type { ProcessedDetections } from '@pages/generate/types/detection';

export type { FurnitureHotspot } from './furnitureHotspotState';

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
      logFurniturePipelineEvent(
        'cors-image-load-failed',
        {
          url,
          error: error instanceof Error ? error.message : String(error),
        },
        { level: 'warn' }
      );
    }
    return null;
  }
}

// 가구 전반 핫스팟 훅
// - reducer 상태 기계로 파이프라인 단계를 가시화하고 액션 기반으로 전이 제어
export function useFurnitureHotspots(
  imageUrl: string,
  mirrored = false,
  enabled = true
) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const corsAbortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const hasRunRef = useRef(false);

  const {
    runInference,
    isLoading,
    error: modelError,
  } = useONNXModel(OBJ365_MODEL_PATH);

  const logHotspotEvent = useCallback(
    (
      event: string,
      payload?: Record<string, unknown>,
      level: 'info' | 'warn' = 'info'
    ) => {
      const { imageUrl: _omitted, ...restPayload } = payload ?? {};
      const hasRestPayload = Object.keys(restPayload).length > 0;
      const enrichedPayload = hasRestPayload
        ? { mirrored, ...restPayload }
        : { mirrored };
      logFurniturePipelineEvent(event, enrichedPayload, { level });
    },
    [mirrored]
  );

  const [state, baseDispatch] = useReducer(
    furnitureHotspotReducer,
    furnitureHotspotInitialState
  );

  const dispatch = useMemo(
    () =>
      createLoggedPipelineDispatch(baseDispatch, (event, payload) =>
        logHotspotEvent(event, payload)
      ),
    [baseDispatch, logHotspotEvent]
  );

  const resetPipeline = useCallback(() => {
    dispatch({ type: 'PIPELINE_RESET' });
  }, [dispatch]);

  const updateRenderMetrics = useCallback(() => {
    const metrics = computeRenderMetrics(imgRef.current, containerRef.current);
    dispatch({ type: 'SET_RENDER_METRICS', payload: metrics });
    return metrics;
  }, [dispatch]);

  const processDetections = useCallback(
    (imageEl: HTMLImageElement, inference: ProcessedDetections) => {
      const result = buildHotspotsPipeline(imageEl, inference);

      logHotspotEvent('pixel-detections', {
        totalDetections: result.debug.pixelDetections.length,
        samples: result.debug.pixelDetections.slice(0, 5).map((det) => ({
          id: det.label ?? null,
          bbox: det.bbox,
          score: det.score,
          className: det.className ?? null,
        })),
      });

      if (result.debug.filteredOut.length > 0) {
        logHotspotEvent('filtered-out-labels', {
          dropped: result.debug.filteredOut,
          allowedCount: result.hotspotCandidates.length,
        });
      }

      if (result.debug.refinedDetections.length > 0) {
        logHotspotEvent('refine-detections', {
          totalDetections: result.debug.refinedDetections.length,
          samples: result.debug.refinedDetections.slice(0, 5).map((det) => ({
            id: det.label ?? null,
            refinedLabel: det.refinedLabel ?? null,
            confidence: det.confidence ?? null,
            bbox: det.bbox,
          })),
        });
      }

      if (result.fallbackTriggered) {
        reportFurniturePipelineWarning('furniture-cabinet-refine-miss', {
          cabinetCount: result.cabinetCount,
        });
      }

      logHotspotEvent('hotspot-candidates', {
        totalCandidates: result.hotspotCandidates.length,
        items: result.debug.debugCandidates,
      });

      logHotspotEvent('label-summary', {
        count: result.debug.labelSummary.length,
        labels: result.debug.labelSummary,
      });

      dispatch({
        type: 'HOTSPOTS_READY',
        payload: {
          hotspots: result.hotspots,
          imageMeta: result.imageMeta,
        },
      });
    },
    [dispatch, imageUrl, logHotspotEvent]
  );

  const toError = (value: unknown): Error =>
    value instanceof Error ? value : new Error(String(value));

  const run = useCallback(async () => {
    if (!enabled) {
      resetPipeline();
      return;
    }
    if (isLoading || modelError) return;
    if (!imgRef.current || !containerRef.current) return;
    if (hasRunRef.current || isRunningRef.current) return;

    const executeInference = async (
      imageEl: HTMLImageElement,
      event: 'inference-start' | 'cors-inference-start'
    ) => {
      const naturalWidth = imageEl.naturalWidth || imageEl.width;
      const naturalHeight = imageEl.naturalHeight || imageEl.height;
      logHotspotEvent(event, {
        naturalWidth,
        naturalHeight,
      });
      updateRenderMetrics();
      const result = await runInference(imageEl);
      logHotspotEvent('raw-detections', {
        totalDetections: result.detections.length,
        samples: result.detections.slice(0, 5),
      });
      processDetections(imageEl, result);
      hasRunRef.current = true;
    };

    const isAbortError = (value: unknown) =>
      value instanceof DOMException && value.name === 'AbortError';

    isRunningRef.current = true;
    dispatch({ type: 'INFERENCE_STARTED' });

    try {
      const imageEl = imgRef.current;
      if (!imageEl) return;
      await executeInference(imageEl, 'inference-start');
    } catch (error) {
      const err = toError(error);
      logHotspotEvent(
        'inference-error-detail',
        {
          name: err.name,
          message: err.message,
        },
        'warn'
      );

      if (error instanceof DOMException && error.name === 'SecurityError') {
        corsAbortRef.current?.abort();
        const controller = new AbortController();
        corsAbortRef.current = controller;
        try {
          const corsImg = await loadCorsImage(imageUrl, controller.signal);
          if (corsImg) {
            try {
              await executeInference(corsImg, 'cors-inference-start');
              return;
            } catch (retryError) {
              if (!isAbortError(retryError)) {
                logHotspotEvent(
                  'inference-retry-failed',
                  {
                    error:
                      retryError instanceof Error
                        ? retryError.message
                        : String(retryError),
                  },
                  'warn'
                );
                dispatch({
                  type: 'PIPELINE_ERROR',
                  payload: { error: toError(retryError) },
                });
              }
            }
          } else {
            logHotspotEvent('cors-image-unavailable', undefined, 'warn');
          }
        } catch (retrySetupError) {
          if (!isAbortError(retrySetupError)) {
            logHotspotEvent(
              'cors-retry-setup-failed',
              {
                error:
                  retrySetupError instanceof Error
                    ? retrySetupError.message
                    : String(retrySetupError),
              },
              'warn'
            );
          }
        } finally {
          corsAbortRef.current = null;
        }
      } else if (!isAbortError(error)) {
        logHotspotEvent('inference-failed', { error: err.message }, 'warn');
        dispatch({ type: 'PIPELINE_ERROR', payload: { error: err } });
      }
    } finally {
      isRunningRef.current = false;
      corsAbortRef.current = null;
    }
  }, [
    dispatch,
    enabled,
    imageUrl,
    isLoading,
    modelError,
    processDetections,
    runInference,
    logHotspotEvent,
    updateRenderMetrics,
    resetPipeline,
  ]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => {
      updateRenderMetrics();
      if (!hasRunRef.current) run();
    };
    if (img.complete) {
      updateRenderMetrics();
      if (!hasRunRef.current) run();
    } else {
      img.addEventListener('load', onLoad);
    }
    return () => img.removeEventListener('load', onLoad);
  }, [imageUrl, run, isLoading, modelError, enabled, updateRenderMetrics]);

  useEffect(
    () => () => {
      corsAbortRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    hasRunRef.current = false;
    resetPipeline();
  }, [imageUrl, mirrored, resetPipeline]);

  const updateContainerSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    dispatch({
      type: 'SET_CONTAINER_SIZE',
      payload: { width: container.clientWidth, height: container.clientHeight },
    });
  }, [dispatch]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => updateContainerSize();
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => update());
      observer.observe(container);
      return () => observer.disconnect();
    }
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateContainerSize]);

  useEffect(() => {
    if (!enabled) return;
    const raf = requestAnimationFrame(() => {
      updateRenderMetrics();
    });
    return () => cancelAnimationFrame(raf);
  }, [
    enabled,
    updateRenderMetrics,
    state.containerSize.width,
    state.containerSize.height,
  ]);

  useEffect(() => {
    if (!state.imageMeta || !state.renderMetrics) {
      dispatch({
        type: 'PROJECTED_READY',
        payload: { projectedHotspots: [], debugRects: [] },
      });
      return;
    }
    const projection = projectHotspots(
      state.hotspots,
      state.renderMetrics,
      state.containerSize,
      mirrored
    );
    if (projection.projectedHotspots.length > 0) {
      logHotspotEvent('projected-hotspots', {
        containerSize: state.containerSize,
        imageMeta: state.imageMeta,
        renderMetrics: state.renderMetrics,
        samples: projection.projectedHotspots.slice(0, 5).map((item) => ({
          id: item.id,
          cx: item.cx,
          cy: item.cy,
          bbox: item.bbox,
        })),
      });
    }
    dispatch({
      type: 'PROJECTED_READY',
      payload: projection,
    });
  }, [
    dispatch,
    logHotspotEvent,
    mirrored,
    state.containerSize,
    state.hotspots,
    state.imageMeta,
    state.renderMetrics,
  ]);

  useEffect(() => {
    if (!enabled) {
      hasRunRef.current = false;
      resetPipeline();
    }
  }, [enabled, resetPipeline]);

  return {
    imgRef,
    containerRef,
    hotspots: state.projectedHotspots,
    debugRects: state.debugRects,
    isLoading:
      isLoading || state.status === 'loading' || state.status === 'processing',
    error: modelError ?? state.error,
  } as const;
}
