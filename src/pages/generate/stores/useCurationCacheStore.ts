import { create } from 'zustand';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
import type {
  FurnitureCategoriesResponse,
  FurnitureProductsInfoResponse,
} from '@pages/generate/types/furniture';

// 카테고리 응답과 감지 객체 집합을 묶어 저장
type CategoryCacheEntry = {
  response: FurnitureCategoriesResponse;
  detectedObjects: FurnitureCategoryCode[];
  detectionSignature: string;
  updatedAt: number;
};

// 카테고리별 추천 상품 응답 저장
type ProductCacheEntry = {
  response: FurnitureProductsInfoResponse;
  updatedAt: number;
};

type GroupCache = {
  categories?: CategoryCacheEntry | null;
  products: Record<number, ProductCacheEntry>;
};

const createDefaultGroup = (): GroupCache => ({
  categories: null,
  products: {},
});

interface CurationCacheStore {
  groups: Record<number, GroupCache>;
  saveCategories: (params: {
    groupId: number;
    response: FurnitureCategoriesResponse;
    detectedObjects: FurnitureCategoryCode[];
    detectionSignature: string;
  }) => void;
  saveProducts: (params: {
    groupId: number;
    categoryId: number;
    response: FurnitureProductsInfoResponse;
  }) => void;
  clearGroupCategories: (groupId: number) => void;
  clearGroupProduct: (groupId: number, categoryId: number) => void;
  clearGroup: (groupId: number) => void;
  clearAll: () => void;
}

export const useCurationCacheStore = create<CurationCacheStore>()((set) => ({
  groups: {},
  saveCategories: ({
    groupId,
    response,
    detectedObjects,
    detectionSignature,
  }) => {
    if (!groupId) return;
    set((state) => {
      const prevGroup = state.groups[groupId] ?? createDefaultGroup();
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...prevGroup,
            categories: {
              response,
              detectedObjects,
              detectionSignature,
              updatedAt: Date.now(),
            },
          },
        },
      };
    });
  },
  saveProducts: ({ groupId, categoryId, response }) => {
    if (!groupId || !categoryId) return;
    set((state) => {
      const prevGroup = state.groups[groupId] ?? createDefaultGroup();
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...prevGroup,
            products: {
              ...prevGroup.products,
              [categoryId]: {
                response,
                updatedAt: Date.now(),
              },
            },
          },
        },
      };
    });
  },
  clearGroupCategories: (groupId) => {
    if (!groupId) return;
    set((state) => {
      const prevGroup = state.groups[groupId];
      if (!prevGroup) return state;
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...prevGroup,
            categories: null,
          },
        },
      };
    });
  },
  clearGroupProduct: (groupId, categoryId) => {
    if (!groupId || !categoryId) return;
    set((state) => {
      const prevGroup = state.groups[groupId];
      if (!prevGroup) return state;
      const nextProducts = { ...prevGroup.products };
      delete nextProducts[categoryId];
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...prevGroup,
            products: nextProducts,
          },
        },
      };
    });
  },
  clearGroup: (groupId) => {
    if (!groupId) return;
    set((state) => {
      const nextGroups = { ...state.groups };
      delete nextGroups[groupId];
      return { groups: nextGroups };
    });
  },
  clearAll: () => set({ groups: {} }),
}));
