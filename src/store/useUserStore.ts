import { create } from 'zustand';

import { useDetectionCacheStore } from '@pages/generate/stores/useDetectionCacheStore';

interface UserStateTypes {
  accessToken: string | null;
  userName: string | null;
  userId: number | null;
  setAuth: (token: string, name: string) => void;
  setAccessToken: (token: string) => void;
  setUserName: (name: string) => void;
  setUserId: (userId: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStateTypes>((set) => ({
  accessToken:
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  userName:
    typeof window !== 'undefined' ? localStorage.getItem('userName') : null,
  userId:
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
        ? Number(localStorage.getItem('userId'))
        : null
      : null,
  setAuth: (token, name) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userName', name);
    set({ accessToken: token, userName: name });
  },
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set((state) => ({ ...state, accessToken: token }));
  },
  setUserName: (name) => {
    localStorage.setItem('userName', name);
    set((state) => ({ ...state, userName: name }));
  },
  setUserId: (userId) => {
    localStorage.setItem('userId', String(userId));
    set((state) => ({ ...state, userId }));
  },
  clearUser: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    set({ accessToken: null, userName: null, userId: null });
    // 세션 감지 캐시 초기화
    useDetectionCacheStore.getState().clear();
  },
}));
