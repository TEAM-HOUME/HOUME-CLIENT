/**
 * Firebase 설정 및 초기화
 *
 * 이 파일의 역할
 * 1. Firebase 앱 초기화 (중복 방지)
 * 2. Remote Config 설정 (A/B 테스트용)
 * 3. Analytics 초기화 (이벤트 추적용)
 *
 * A/B 테스트 연동:
 * - Remote Config: Firebase Console에서 사용자 그룹 분할
 * - Analytics: 사용자 행동 추적 및 분석
 */

import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

/** Firebase 프로젝트 설정 (환경변수에서 가져옴) */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase 앱 초기화 (중복 방지)
 * - getApps(): 이미 초기화된 앱이 있는지 확인
 * - 있으면 기존 앱 반환, 없으면 새로 초기화
 * - HMR(Hot Module Replacement) 환경에서 중복 초기화 방지
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/** Firebase Analytics 인스턴스 (브라우저 환경에서만 초기화) */
let analytics: Analytics | null = null;

/**
 * Firebase Analytics 초기화 함수
 *
 * 초기화 과정:
 * 1. 브라우저 환경 확인 (window 객체 존재)
 * 2. Analytics 지원 여부 확인 (isSupported)
 * 3. Analytics 인스턴스 생성 및 반환
 *
 * @returns {Promise<Analytics | null>} 초기화된 Analytics 인스턴스 또는 null
 */
const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(app);
        // console.log('Firebase Analytics 초기화 완료');
        // console.log(
        //   'Measurement ID:',
        //   import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
        // );
        return analytics;
      } else {
        // console.warn('Firebase Analytics가 지원되지 않는 환경입니다');
        return null;
      }
    } catch (error) {
      console.error('Firebase Analytics 초기화 오류:', error);
      return null;
    }
  }
  return null;
};

// 즉시 Analytics 초기화 시작 (비동기)
initAnalytics();

/**
 * Firebase Remote Config 인스턴스
 *
 * A/B 테스트 용도:
 * - Firebase Console에서 사용자 그룹 분할 설정
 * - 매개변수: image_generation_variant
 * - 조건: generate_single_50 (50% 사용자에게 'single' 반환)
 */
export const remoteConfig = getRemoteConfig(app);

/**
 * Remote Config 설정
 *
 * 캐싱 정책:
 * - minimumFetchIntervalMillis: 1시간 (캐시된 값 사용 기간)
 * - fetchTimeoutMillis: 60초 (요청 타임아웃)
 *
 * 개발 시에는 더 짧은 간격으로 설정 가능:
 * - minimumFetchIntervalMillis: 60000 (1분)
 */
remoteConfig.settings = {
  minimumFetchIntervalMillis: 60000, // 1분 (개발 시 캐시 시간 단축)
  fetchTimeoutMillis: 60000, // 60초
};

/**
 * Remote Config 기본값 설정
 *
 * A/B 테스트 매개변수:
 * - image_generation_variant: 'multiple' (기본값)
 * - Firebase Console에서 조건 generate_single_50 만족 시 'single' 반환
 * - 결과: 50% 사용자는 'multiple', 50% 사용자는 'single' 받음
 */
remoteConfig.defaultConfig = {
  image_generation_variant: 'multiple', // 'single' 또는 'multiple'
};

/** Firebase Analytics 인스턴스 export */
export { analytics };

/** Firebase 앱 인스턴스 export */
export default app;
