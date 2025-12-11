// 가구 큐레이션 전역 상태 스토어 정의
import { create } from 'zustand';

import { logFurniturePipelineEvent } from '@pages/generate/utils/furniturePipelineMonitor';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';

// 바텀시트 스냅 상태 타입 정의
export type CurationSnapState = 'collapsed' | 'mid' | 'expanded' | 'hidden';

// 이미지별 큐레이션 상태 구조 정의
interface ImageCurationState {
  hotspots: FurnitureHotspot[];
  detectedObjects: FurnitureCategoryCode[];
  selectedHotspotId: number | null;
  selectedCategoryId: number | null;
}

// 스토어 전체 상태 타입 정의
interface FurnitureCurationState {
  activeImageId: number | null;
  images: Record<number, ImageCurationState>;
  sheetSnapState: CurationSnapState;
  setActiveImage: (imageId: number | null) => void;
  setImageDetection: (
    imageId: number,
    payload: {
      hotspots: FurnitureHotspot[];
      detectedObjects: FurnitureCategoryCode[];
    }
  ) => void;
  selectHotspot: (imageId: number, hotspotId: number | null) => void;
  selectCategory: (imageId: number, categoryId: number | null) => void;
  setSheetSnapState: (snap: CurationSnapState) => void;
  resetImageState: (imageId: number) => void;
  resetAll: () => void;
}

// 이미지 상태 기본값 생성 유틸 정의
const createDefaultImageState = (): ImageCurationState => ({
  hotspots: [],
  detectedObjects: [],
  selectedHotspotId: null,
  selectedCategoryId: null,
});

const areCodeArraysEqual = (
  a: FurnitureCategoryCode[],
  b: FurnitureCategoryCode[]
) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const areHotspotsEqual = (
  prev: FurnitureHotspot[],
  next: FurnitureHotspot[]
) => {
  if (prev === next) return true;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const prevHotspot = prev[i];
    const nextHotspot = next[i];
    if (
      prevHotspot.id !== nextHotspot.id ||
      prevHotspot.cx !== nextHotspot.cx ||
      prevHotspot.cy !== nextHotspot.cy ||
      prevHotspot.finalLabel !== nextHotspot.finalLabel ||
      prevHotspot.score !== nextHotspot.score ||
      prevHotspot.confidence !== nextHotspot.confidence
    ) {
      return false;
    }
  }
  return true;
};

export const useCurationStore = create<FurnitureCurationState>((set, get) => ({
  activeImageId: null,
  images: {},
  sheetSnapState: 'collapsed',
  setActiveImage: (imageId) => {
    const state = get();
    if (imageId === null) {
      // 이미 닫힌 상태면 추가 업데이트 생략
      if (
        state.activeImageId === null &&
        state.sheetSnapState === 'collapsed'
      ) {
        return;
      }
      set(() => ({
        activeImageId: null,
        sheetSnapState: 'collapsed',
      }));
      return;
    }
    const hasImageState = Boolean(state.images[imageId]);
    const nextImages = hasImageState
      ? state.images
      : { ...state.images, [imageId]: createDefaultImageState() };
    if (
      state.activeImageId === imageId &&
      hasImageState &&
      state.sheetSnapState === 'collapsed'
    ) {
      return;
    }
    // 신규 이미지 선택 시 기본 상태 생성 및 스냅 접기
    set(() => ({
      activeImageId: imageId,
      images: nextImages,
      sheetSnapState: 'collapsed',
    }));
  },
  setImageDetection: (imageId, payload) =>
    set((state) => {
      const prevImageState = state.images[imageId] ?? createDefaultImageState();
      const nextHotspots = payload.hotspots;
      const nextDetectedObjects = payload.detectedObjects;
      const prevHotspots = prevImageState.hotspots;
      const prevDetectedObjects = prevImageState.detectedObjects;
      const hotspotsChanged = !areHotspotsEqual(prevHotspots, nextHotspots);
      const detectedObjectsChanged = !areCodeArraysEqual(
        prevDetectedObjects,
        nextDetectedObjects
      );
      // 감지된 객체 배열 로깅
      logFurniturePipelineEvent('detected-objects-store', {
        imageId,
        hotspotCount: nextHotspots.length,
        detectedObjects: nextDetectedObjects,
      });

      // 요구사항: 추론된 핫스팟 기본 값은 해제 상태 유지
      // - 이전 선택이 유효하더라도 초기 진입 시 자동 선택하지 않음
      // - 최초 설정은 항상 null 로 두고 클릭 시에만 선택하도록 위임
      const nextSelectedHotspotId = null;
      const shouldResetCategory = hotspotsChanged || detectedObjectsChanged;
      const nextSelectedCategoryId = shouldResetCategory
        ? null
        : prevImageState.selectedCategoryId;

      if (
        !hotspotsChanged &&
        !detectedObjectsChanged &&
        prevImageState.selectedHotspotId === nextSelectedHotspotId &&
        prevImageState.selectedCategoryId === nextSelectedCategoryId
      ) {
        return state;
      }

      return {
        images: {
          ...state.images,
          [imageId]: {
            hotspots: nextHotspots,
            detectedObjects: nextDetectedObjects,
            selectedHotspotId: nextSelectedHotspotId,
            selectedCategoryId: nextSelectedCategoryId,
          },
        },
      };
    }),
  selectHotspot: (imageId, hotspotId) =>
    set((state) => {
      const prevImageState = state.images[imageId] ?? createDefaultImageState();
      if (prevImageState.selectedHotspotId === hotspotId) {
        return state;
      }
      return {
        images: {
          ...state.images,
          [imageId]: {
            ...prevImageState,
            selectedHotspotId: hotspotId,
          },
        },
      };
    }),
  selectCategory: (imageId, categoryId) =>
    set((state) => {
      const prevImageState = state.images[imageId] ?? createDefaultImageState();
      if (prevImageState.selectedCategoryId === categoryId) {
        return state;
      }
      return {
        images: {
          ...state.images,
          [imageId]: {
            ...prevImageState,
            selectedCategoryId: categoryId,
          },
        },
      };
    }),
  setSheetSnapState: (snap) =>
    set((state) => {
      // 동일 상태면 변경 불필요
      if (state.sheetSnapState === snap) {
        return state;
      }

      // 바텀시트가 닫힐 때(collapsed) 활성 이미지의 선택된 핫스팟 해제
      // - 요구사항: 시트를 해제하면 선택된 핫스팟도 함께 해제
      if (snap === 'collapsed') {
        const activeId = state.activeImageId;
        if (activeId !== null) {
          const prev = state.images[activeId] ?? createDefaultImageState();
          if (prev.selectedHotspotId !== null) {
            return {
              sheetSnapState: snap,
              images: {
                ...state.images,
                [activeId]: {
                  ...prev,
                  // 선택된 핫스팟 해제
                  selectedHotspotId: null,
                },
              },
            };
          }
        }
      }

      // 기본: 스냅 상태만 갱신
      return {
        sheetSnapState: snap,
      };
    }),
  resetImageState: (imageId) =>
    set((state) => {
      if (!(imageId in state.images)) {
        return state;
      }
      const nextImages = { ...state.images };
      nextImages[imageId] = createDefaultImageState();
      return {
        images: nextImages,
        sheetSnapState:
          state.activeImageId === imageId ? 'collapsed' : state.sheetSnapState,
      };
    }),
  resetAll: () =>
    set(() => ({
      activeImageId: null,
      images: {},
      sheetSnapState: 'collapsed',
    })),
}));

// 활성 이미지 상태 선택 헬퍼 정의
export const selectActiveImageState = (state: FurnitureCurationState) => {
  const imageId = state.activeImageId;
  if (imageId === null) return null;
  return state.images[imageId] ?? null;
};
