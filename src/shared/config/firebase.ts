import { getApp, getApps, initializeApp } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase 앱 초기화
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Remote Config 초기화
export const remoteConfig = getRemoteConfig(app);

// Remote Config 설정
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1시간 (개발 시에는 더 짧게 설정 가능)
  fetchTimeoutMillis: 60000, // 60초
};

// 기본값 설정
remoteConfig.defaultConfig = {
  image_generation_variant: 'multiple', // 'single' 또는 'multiple'
};

export default app;
