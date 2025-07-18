import { create } from 'zustand';

interface GenerateState {
  isApiCompleted: boolean;
  setApiCompleted: (completed: boolean) => void;
  resetGenerate: () => void;
}

export const useGenerateStore = create<GenerateState>((set) => ({
  isApiCompleted: false,
  setApiCompleted: (completed: boolean) => set({ isApiCompleted: completed }),
  resetGenerate: () => set({ isApiCompleted: false }),
}));
