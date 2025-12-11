import { useCallback, useRef } from 'react';

import { OBJ365_MODEL_PATH } from '@pages/generate/constants/detection';
import { buildHotspotsPipeline } from '@pages/generate/hooks/furnitureHotspotPipeline';
import { loadCorsImage } from '@pages/generate/hooks/useFurnitureHotspots';
import { useONNXModel } from '@pages/generate/hooks/useOnnxModel';
import { useDetectionCacheStore } from '@pages/generate/stores/useDetectionCacheStore';
import {
  filterAllowedDetectedObjects,
  mapHotspotsToDetectedObjects,
} from '@pages/generate/utils/detectedObjectMapper';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { ProcessedDetections } from '@pages/generate/types/detection';

/**
 * 외부 이미지 요소 로더
 * - crossOrigin 허용을 기본으로 시도
 * - 실패 시 에러를 상위로 전달
 */
const loadImageElement = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = (event) =>
      reject(
        event instanceof ErrorEvent
          ? event.error
          : new Error('이미지 로드 실패')
      );
    img.src = url;
  });

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

type PrefetchPriority = 'immediate' | 'background';

export interface DetectionPrefetchOptions {
  priority?: PrefetchPriority;
}

type PrefetchTask = {
  imageId: number;
  imageUrl: string;
};

/**
 * 마이페이지 카드 클릭 직전 감지 프리페치를 수행하는 훅
 * - 클릭 단일 건만 즉시 처리하고, 나머지는 기존 파이프라인대로 진행
 */
export const useDetectionPrefetch = () => {
  const { runInference, isLoading, error } = useONNXModel(OBJ365_MODEL_PATH);
  const setEntry = useDetectionCacheStore((state) => state.setEntry);
  const pendingRef = useRef<Set<number>>(new Set());
  const queueRef = useRef<PrefetchTask[]>([]);
  const drainingRef = useRef(false);

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
      const rawDetectedObjects = mapHotspotsToDetectedObjects(
        pipeline.hotspots
      );
      const detectedObjects = filterAllowedDetectedObjects(rawDetectedObjects, {
        stage: 'prefetch-detection',
        imageId,
        hotspotCount: pipeline.hotspots.length,
      });

      storeDetections(imageId, imageUrl, processed, {
        hotspots: pipeline.hotspots,
        detectedObjects,
      });
    },
    [storeDetections]
  );

  const executePrefetch = useCallback(
    async (imageId: number, imageUrl: string) => {
      if (!imageId || !imageUrl) return;
      if (pendingRef.current.has(imageId)) return;
      const cached = useDetectionCacheStore.getState().images[imageId];
      if (cached) return;
      if (isLoading || error) return;

      pendingRef.current.add(imageId);
      try {
        let targetImage: HTMLImageElement | null = null;
        try {
          targetImage = await loadImageElement(imageUrl);
        } catch {
          targetImage = await loadCorsImage(imageUrl);
        }
        if (!targetImage) return;

        try {
          const result = await runInference(targetImage);
          processAndStore(imageId, imageUrl, targetImage, result);
          return;
        } catch (inferenceError) {
          if (
            inferenceError instanceof DOMException &&
            inferenceError.name === 'SecurityError'
          ) {
            const corsImage = await loadCorsImage(imageUrl);
            if (!corsImage) return;
            const corsResult = await runInference(corsImage);
            processAndStore(imageId, imageUrl, corsImage, corsResult);
            return;
          }
          console.warn('감지 프리페치 실패', inferenceError);
        }
      } catch (unexpectedError) {
        console.warn('감지 프리페치 예외', unexpectedError);
      } finally {
        pendingRef.current.delete(imageId);
      }
    },
    [error, isLoading, processAndStore, runInference]
  );

  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const task = queueRef.current.shift();
        if (!task) continue;
        await executePrefetch(task.imageId, task.imageUrl);
        await sleep(120); // 감지 모델 연속 호출 완화
      }
    } finally {
      drainingRef.current = false;
    }
  }, [executePrefetch]);

  const scheduleBackgroundPrefetch = useCallback(
    (imageId: number, imageUrl: string) => {
      if (!imageId || !imageUrl) return;
      if (queueRef.current.some((task) => task.imageId === imageId)) return;
      queueRef.current.push({ imageId, imageUrl });
      void drainQueue();
    },
    [drainQueue]
  );

  const prefetchDetection = useCallback(
    (imageId: number, imageUrl: string, options?: DetectionPrefetchOptions) => {
      const priority = options?.priority ?? 'background';
      if (priority === 'immediate') {
        void executePrefetch(imageId, imageUrl);
        return;
      }
      scheduleBackgroundPrefetch(imageId, imageUrl);
    },
    [executePrefetch, scheduleBackgroundPrefetch]
  );

  return {
    prefetchDetection,
  };
};
