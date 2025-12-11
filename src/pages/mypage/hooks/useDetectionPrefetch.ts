import { useCallback, useRef } from 'react';

import { OBJ365_MODEL_PATH } from '@pages/generate/constants/detection';
import { loadCorsImage } from '@pages/generate/hooks/useFurnitureHotspots';
import { useONNXModel } from '@pages/generate/hooks/useOnnxModel';
import { useDetectionCacheStore } from '@pages/generate/stores/useDetectionCacheStore';

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

/**
 * 마이페이지 카드 클릭 직전 감지 프리페치를 수행하는 훅
 * - 클릭 단일 건만 즉시 처리하고, 나머지는 기존 파이프라인대로 진행
 */
export const useDetectionPrefetch = () => {
  const { runInference, isLoading, error } = useONNXModel(OBJ365_MODEL_PATH);
  const setEntry = useDetectionCacheStore((state) => state.setEntry);
  const pendingRef = useRef<Set<number>>(new Set());

  const storeDetections = useCallback(
    (imageId: number, imageUrl: string, payload: ProcessedDetections) => {
      setEntry(imageId, {
        imageUrl,
        processedDetections: payload,
        hotspots: [], // 화면 투영은 결과 페이지에서 다시 계산
      });
    },
    [setEntry]
  );

  const prefetchDetection = useCallback(
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
        } catch (loadError) {
          targetImage = await loadCorsImage(imageUrl);
        }
        if (!targetImage) return;

        try {
          const result = await runInference(targetImage);
          storeDetections(imageId, imageUrl, result);
          return;
        } catch (inferenceError) {
          if (
            inferenceError instanceof DOMException &&
            inferenceError.name === 'SecurityError'
          ) {
            const corsImage = await loadCorsImage(imageUrl);
            if (!corsImage) return;
            const corsResult = await runInference(corsImage);
            storeDetections(imageId, imageUrl, corsResult);
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
    [error, isLoading, runInference, storeDetections]
  );

  return {
    prefetchDetection,
  };
};
