import { create } from 'zustand';

import type { GeneratedImagePayload } from '@pages/generate/types/generate';

// LoadingPage의 이미지 생성 mutation 응답에서 ResultPage 진입에 필요한 데이터
// mutation fetcher가 narrow한 GeneratedImagePayload를 그대로 사용
interface GenerateState {
  isApiCompleted: boolean;
  navigationData: GeneratedImagePayload | null;
  setApiCompleted: (completed: boolean) => void;
  setNavigationData: (data: GeneratedImagePayload) => void;
  resetGenerate: () => void;
}

export const useGenerateStore = create<GenerateState>((set) => ({
  isApiCompleted: false,
  navigationData: null,
  setApiCompleted: (completed) => set({ isApiCompleted: completed }),
  setNavigationData: (data) => set({ navigationData: data }),
  resetGenerate: () => set({ isApiCompleted: false, navigationData: null }),
}));
