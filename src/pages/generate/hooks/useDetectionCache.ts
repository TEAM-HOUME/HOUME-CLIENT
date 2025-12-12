import { useCallback, useEffect, useMemo } from 'react';

import {
  useDetectionCacheStore,
  type DetectionCacheEntry,
} from '@pages/generate/stores/useDetectionCacheStore';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { ProcessedDetections } from '@pages/generate/types/detection';

export const DETECTION_CACHE_TTL = 30 * 60 * 1000; // 30분

type SavePayload = {
  processedDetections: ProcessedDetections;
  hotspots: FurnitureHotspot[];
  detectedObjects?: FurnitureCategoryCode[];
};

type UseDetectionCacheOptions = {
  initialEntry?: DetectionCacheEntry | null;
};

export function useDetectionCache(
  imageId: number | null,
  imageUrl: string,
  options?: UseDetectionCacheOptions
) {
  const initialEntry = options?.initialEntry ?? null;
  const storeEntry = useDetectionCacheStore((state) =>
    imageId ? (state.images[imageId] ?? null) : null
  );
  const setEntry = useDetectionCacheStore((state) => state.setEntry);
  const removeEntry = useDetectionCacheStore((state) => state.removeEntry);

  const isExpired = useMemo(() => {
    if (!storeEntry) return false;
    if (storeEntry.imageUrl !== imageUrl) return true;
    return Date.now() - storeEntry.updatedAt > DETECTION_CACHE_TTL;
  }, [storeEntry, imageUrl]);

  useEffect(() => {
    if (!imageId || !initialEntry) return;
    const candidate = initialEntry;
    if (candidate.imageUrl !== imageUrl) return;
    if (!storeEntry || candidate.updatedAt > storeEntry.updatedAt) {
      setEntry(imageId, candidate);
    }
  }, [imageId, imageUrl, initialEntry, setEntry, storeEntry]);

  useEffect(() => {
    if (!imageId || !isExpired) return;
    removeEntry(imageId);
  }, [imageId, isExpired, removeEntry]);

  const effectiveEntry = isExpired ? null : storeEntry;

  const prefetchedDetections = effectiveEntry?.processedDetections ?? null;

  const saveEntry = useCallback(
    ({ processedDetections, hotspots, detectedObjects }: SavePayload) => {
      if (!imageId) return;
      setEntry(imageId, {
        imageUrl,
        processedDetections,
        hotspots,
        detectedObjects,
      });
    },
    [imageId, imageUrl, setEntry]
  );

  const clearEntry = useCallback(() => {
    if (!imageId) return;
    removeEntry(imageId);
  }, [imageId, removeEntry]);

  return {
    entry: effectiveEntry,
    prefetchedDetections,
    saveEntry,
    clearEntry,
  } as const;
}

export const primeDetectionCacheEntry = (
  imageId: number,
  payload: DetectionCacheEntry
) => {
  if (!imageId) return;
  useDetectionCacheStore.getState().setEntry(imageId, payload);
};
