import { create } from 'zustand';

interface GenerateState {
  isApiCompleted: boolean;
  navigationData: any;
  setApiCompleted: (completed: boolean) => void;
  setNavigationData: (data: any) => void;
  resetGenerate: () => void;
}

export const useGenerateStore = create<GenerateState>((set) => ({
  isApiCompleted: false,
  navigationData: null,
  setApiCompleted: (completed: boolean) => set({ isApiCompleted: completed }),
  setNavigationData: (data: any) => set({ navigationData: data }),
  resetGenerate: () => set({ isApiCompleted: false, navigationData: null }),
}));
