import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ProcessedDetections } from '@pages/generate/types/detection';

// 세션 감지 캐시 저장소 키 정의
const CACHE_STORAGE_KEY = 'houme-detection-cache';

export interface DetectionCacheEntry {
  imageUrl: string;
  processedDetections: ProcessedDetections;
  updatedAt: number;
}

interface DetectionCacheStore {
  images: Record<number, DetectionCacheEntry>;
  setEntry: (
    imageId: number,
    payload: Pick<DetectionCacheEntry, 'imageUrl' | 'processedDetections'>
  ) => void;
  removeEntry: (imageId: number) => void;
  clear: () => void;
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage<DetectionCacheStore>(() => window.sessionStorage)
    : undefined;

export const useDetectionCacheStore = create<DetectionCacheStore>()(
  persist(
    (set) => ({
      images: {},
      setEntry: (imageId, payload) => {
        if (!imageId) return;
        set((state) => ({
          images: {
            ...state.images,
            [imageId]: {
              imageUrl: payload.imageUrl,
              processedDetections: payload.processedDetections,
              updatedAt: Date.now(),
            },
          },
        }));
      },
      removeEntry: (imageId) =>
        set((state) => {
          const nextImages = { ...state.images };
          delete nextImages[imageId];
          return { images: nextImages };
        }),
      clear: () => set({ images: {} }),
    }),
    {
      name: CACHE_STORAGE_KEY,
      storage,
      partialize: (state) => ({ images: state.images }),
      version: 1,
    }
  )
);
