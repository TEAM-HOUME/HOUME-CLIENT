import { useCallback, useEffect, useRef } from 'react';

import { OBJ365_MODEL_PATH } from '@shared/detection/constants';
import type { FurnitureCategoryCode } from '@shared/detection/furnitureCategoryMapping';
import { buildHotspotsPipeline } from '@shared/detection/hooks/furnitureHotspotPipeline';
import {
  loadCorsImage,
  type FurnitureHotspot,
} from '@shared/detection/hooks/useFurnitureHotspots';
import { useONNXModel } from '@shared/detection/hooks/useOnnxModel';
import { useDetectionCacheStore } from '@shared/detection/stores/useDetectionCacheStore';
import type { ProcessedDetections } from '@shared/detection/types';
import { mapHotspotsToDetectedObjects } from '@shared/detection/utils/detectedObjectMapper';
import { runSerializedInferenceTask } from '@shared/detection/utils/inferenceTaskScheduler';

import type {
  DetectionPrefetchOptions,
  PrefetchTask,
} from './detectionPrefetch.types';

const PREFETCH_DELAY_MS = 120;
const MAX_CONCURRENCY = 1;
const IMAGE_LOAD_TIMEOUT_MS = 12_000;
const MAX_PREFETCH_QUEUE_SIZE = 2;
const LOW_MEMORY_DEVICE_GB_THRESHOLD = 2;

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

/**
 * 외부 이미지 요소 로더
 * - crossOrigin 허용을 기본으로 시도
 * - 실패 시 에러를 상위로 전달
 */
const loadImageElement = (url: string, signal?: AbortSignal) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    let settled = false;
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
      signal?.removeEventListener('abort', handleAbort);
    };
    const finalizeReject = (reason: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(reason);
    };
    const handleAbort = () => {
      img.src = '';
      finalizeReject(new DOMException('이미지 로드 취소', 'AbortError'));
    };
    const timeoutId = window.setTimeout(() => {
      img.src = '';
      finalizeReject(
        new Error(`이미지 로드 타임아웃(${IMAGE_LOAD_TIMEOUT_MS}ms)`)
      );
    }, IMAGE_LOAD_TIMEOUT_MS);

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener('abort', handleAbort, { once: true });
    img.onload = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(img);
    };
    img.onerror = (event) => {
      finalizeReject(
        event instanceof ErrorEvent
          ? event.error
          : new Error('이미지 로드 실패')
      );
    };
    img.src = url;
  });

const isAbortError = (value: unknown) =>
  value instanceof DOMException && value.name === 'AbortError';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * 감지(inference) 결과를 사전 계산해 캐시에 적재하는 훅
 * - 즉시(immediate) 요청과 백그라운드 큐를 분리해 성능 균형 유지
 */
export const useDetectionPrefetchClient = () => {
  const { runInference, isLoading, error } = useONNXModel(OBJ365_MODEL_PATH);
  const setEntry = useDetectionCacheStore((state) => state.setEntry);
  const modelStateRef = useRef({ isLoading, error });
  const isMountedRef = useRef(true);
  const pendingRef = useRef<Set<number>>(new Set());
  const queueRef = useRef<PrefetchTask[]>([]);
  const drainingRef = useRef(false);
  const activeCountRef = useRef(0); // 동시에 실행 중인 작업 수
  const waitersRef = useRef<(() => void)[]>([]); // 세마포어 대기열
  const inflightControllersRef = useRef<
    Map<
      number,
      {
        controller: AbortController;
        persistAfterUnmount: boolean;
      }
    >
  >(new Map());
  const shouldPausePrefetch = useCallback(() => {
    if (typeof document !== 'undefined' && document.hidden) return true;
    if (typeof navigator === 'undefined') return false;
    const deviceMemory = (navigator as NavigatorWithDeviceMemory).deviceMemory;
    return (
      typeof deviceMemory === 'number' &&
      deviceMemory <= LOW_MEMORY_DEVICE_GB_THRESHOLD
    );
  }, []);

  const stopPrefetchTasks = useCallback(() => {
    queueRef.current = [];
    pendingRef.current.clear();
    inflightControllersRef.current.forEach(({ controller }) =>
      controller.abort()
    );
    inflightControllersRef.current.clear();
  }, []);

  // 세마포어 슬롯 확보
  const acquireSlot = useCallback(async () => {
    if (activeCountRef.current < MAX_CONCURRENCY) {
      activeCountRef.current += 1;
      return;
    }
    await new Promise<void>((resolve) => {
      waitersRef.current.push(resolve);
    });
    activeCountRef.current += 1;
  }, []);

  // 세마포어 슬롯 반환
  const releaseSlot = useCallback(() => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    const next = waitersRef.current.shift();
    if (next) {
      next();
    }
  }, []);

  // 공통 실행 래퍼: 동시 실행 상한 적용
  const runWithSemaphore = useCallback(
    async (task: () => Promise<void>) => {
      await acquireSlot();
      try {
        await task();
      } finally {
        releaseSlot();
      }
    },
    [acquireSlot, releaseSlot]
  );

  const storeDetections = useCallback(
    (
      imageId: number,
      imageUrl: string,
      payload: ProcessedDetections,
      extra?: {
        hotspots?: FurnitureHotspot[];
        detectedObjects?: FurnitureCategoryCode[];
      }
    ) => {
      setEntry(imageId, {
        imageUrl,
        processedDetections: payload,
        hotspots: extra?.hotspots ?? [],
        detectedObjects: extra?.detectedObjects,
      });
    },
    [setEntry]
  );

  const processAndStore = useCallback(
    (
      imageId: number,
      imageUrl: string,
      targetImage: HTMLImageElement,
      processed: ProcessedDetections
    ) => {
      const pipeline = buildHotspotsPipeline(targetImage, processed);
      const detectedObjects = mapHotspotsToDetectedObjects(pipeline.hotspots);

      storeDetections(imageId, imageUrl, processed, {
        hotspots: pipeline.hotspots,
        detectedObjects,
      });
    },
    [storeDetections]
  );

  const executePrefetch = useCallback(
    async (
      imageId: number,
      imageUrl: string,
      options?: DetectionPrefetchOptions
    ) => {
      if (!imageId || !imageUrl) return;
      if (pendingRef.current.has(imageId)) return;
      const cached = useDetectionCacheStore.getState().images[imageId];
      if (cached) return;

      const persistAfterUnmount = options?.persistAfterUnmount ?? false;
      if (modelStateRef.current.error) return;
      if (modelStateRef.current.isLoading && !persistAfterUnmount) return;
      const shouldSkipBecauseUnmounted =
        !isMountedRef.current && !persistAfterUnmount;
      if (shouldSkipBecauseUnmounted) return;

      const controller = new AbortController();
      inflightControllersRef.current.set(imageId, {
        controller,
        persistAfterUnmount,
      });
      pendingRef.current.add(imageId);
      try {
        const runQueuedInference = async (target: HTMLImageElement) =>
          runSerializedInferenceTask(async () => {
            if (
              controller.signal.aborted ||
              (!isMountedRef.current && !persistAfterUnmount)
            ) {
              throw new DOMException('프리페치 추론 취소', 'AbortError');
            }
            return runInference(target);
          });

        if (
          controller.signal.aborted ||
          (!isMountedRef.current && !persistAfterUnmount)
        ) {
          return;
        }

        let targetImage: HTMLImageElement | null = null;
        try {
          targetImage = await loadImageElement(imageUrl, controller.signal);
        } catch {
          if (
            controller.signal.aborted ||
            (!isMountedRef.current && !persistAfterUnmount)
          ) {
            return;
          }
          targetImage = await loadCorsImage(imageUrl, controller.signal);
        }
        if (
          !targetImage ||
          controller.signal.aborted ||
          (!isMountedRef.current && !persistAfterUnmount)
        ) {
          return;
        }

        try {
          const result = await runQueuedInference(targetImage);
          if (
            controller.signal.aborted ||
            (!isMountedRef.current && !persistAfterUnmount)
          ) {
            return;
          }
          processAndStore(imageId, imageUrl, targetImage, result);
          return;
        } catch (inferenceError) {
          if (isAbortError(inferenceError)) return;
          if (
            inferenceError instanceof DOMException &&
            inferenceError.name === 'SecurityError'
          ) {
            const corsImage = await loadCorsImage(imageUrl, controller.signal);
            if (
              !corsImage ||
              controller.signal.aborted ||
              (!isMountedRef.current && !persistAfterUnmount)
            ) {
              return;
            }
            const corsResult = await runQueuedInference(corsImage);
            if (
              controller.signal.aborted ||
              (!isMountedRef.current && !persistAfterUnmount)
            ) {
              return;
            }
            processAndStore(imageId, imageUrl, corsImage, corsResult);
            return;
          }
          console.warn('감지 프리페치 실패', inferenceError);
        }
      } catch (unexpectedError) {
        if (isAbortError(unexpectedError)) return;
        console.warn('감지 프리페치 예외', unexpectedError);
      } finally {
        inflightControllersRef.current.delete(imageId);
        pendingRef.current.delete(imageId);
      }
    },
    [processAndStore, runInference]
  );

  // 백그라운드 큐를 순차로 소모해 모델 호출 폭주 방지
  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return;
    if (shouldPausePrefetch()) {
      stopPrefetchTasks();
      return;
    }
    drainingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        if (shouldPausePrefetch()) {
          stopPrefetchTasks();
          break;
        }
        if (modelStateRef.current.isLoading || modelStateRef.current.error) {
          break;
        }
        const task = queueRef.current.shift();
        if (!task) continue;
        await runWithSemaphore(async () => {
          await executePrefetch(task.imageId, task.imageUrl, {
            persistAfterUnmount: task.persistAfterUnmount,
          });
          await sleep(PREFETCH_DELAY_MS); // 감지 모델 연속 호출 완화
        });
      }
    } finally {
      drainingRef.current = false;
      if (
        isMountedRef.current &&
        queueRef.current.length > 0 &&
        !shouldPausePrefetch() &&
        !modelStateRef.current.isLoading &&
        !modelStateRef.current.error
      ) {
        void drainQueue();
      }
    }
  }, [
    executePrefetch,
    runWithSemaphore,
    shouldPausePrefetch,
    stopPrefetchTasks,
  ]);

  const scheduleBackgroundPrefetch = useCallback(
    (imageId: number, imageUrl: string, options?: DetectionPrefetchOptions) => {
      if (!imageId || !imageUrl) return;
      if (shouldPausePrefetch()) {
        stopPrefetchTasks();
        return;
      }
      if (queueRef.current.some((task) => task.imageId === imageId)) return;
      if (queueRef.current.length >= MAX_PREFETCH_QUEUE_SIZE) {
        queueRef.current.shift();
      }
      queueRef.current.push({
        imageId,
        imageUrl,
        persistAfterUnmount: options?.persistAfterUnmount ?? false,
      });
      void drainQueue();
    },
    [drainQueue, shouldPausePrefetch, stopPrefetchTasks]
  );

  const prefetchDetection = useCallback(
    (imageId: number, imageUrl: string, options?: DetectionPrefetchOptions) => {
      if (shouldPausePrefetch()) {
        stopPrefetchTasks();
        return;
      }
      const priority = options?.priority ?? 'background';
      const persistAfterUnmount = options?.persistAfterUnmount ?? false;
      if (priority === 'immediate') {
        if (modelStateRef.current.error) {
          scheduleBackgroundPrefetch(imageId, imageUrl, options);
          return;
        }
        if (modelStateRef.current.isLoading) {
          if (persistAfterUnmount) {
            void runWithSemaphore(() =>
              executePrefetch(imageId, imageUrl, {
                persistAfterUnmount,
              })
            );
            return;
          }
          scheduleBackgroundPrefetch(imageId, imageUrl, options);
          return;
        }
        void runWithSemaphore(() =>
          executePrefetch(imageId, imageUrl, {
            persistAfterUnmount,
          })
        );
        return;
      }
      scheduleBackgroundPrefetch(imageId, imageUrl, options);
    },
    [
      executePrefetch,
      runWithSemaphore,
      scheduleBackgroundPrefetch,
      shouldPausePrefetch,
      stopPrefetchTasks,
    ]
  );

  useEffect(() => {
    modelStateRef.current = { isLoading, error };
    if (shouldPausePrefetch()) {
      stopPrefetchTasks();
      return;
    }
    if (!isLoading && !error && queueRef.current.length > 0) {
      void drainQueue();
    }
  }, [isLoading, error, drainQueue, shouldPausePrefetch, stopPrefetchTasks]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      if (shouldPausePrefetch()) {
        stopPrefetchTasks();
        return;
      }
      if (
        !modelStateRef.current.isLoading &&
        !modelStateRef.current.error &&
        queueRef.current.length > 0
      ) {
        void drainQueue();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [drainQueue, shouldPausePrefetch, stopPrefetchTasks]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      queueRef.current = [];
      pendingRef.current.clear();
      activeCountRef.current = 0;
      inflightControllersRef.current.forEach(
        ({ controller, persistAfterUnmount }) => {
          if (!persistAfterUnmount) {
            controller.abort();
          }
        }
      );
      inflightControllersRef.current.clear();
      waitersRef.current.splice(0).forEach((resolve) => resolve());
    };
  }, []);

  return { prefetchDetection };
};
