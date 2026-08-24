/// <reference types="vite/client" />

/**
 * 코드에서 쓰는 `import.meta.env.VITE_*`를 전부 여기에 선언한다.
 *
 * 여기에 없는 이름은 Vite가 기본 제공하는 `[key: string]: any` 인덱스 시그니처로
 * 떨어진다. 그러면 이름을 오타 내도 컴파일이 통과하고 런타임에 undefined가 되며,
 * 타입이 any라 그 값을 받는 쪽의 검사까지 함께 풀린다.
 *
 * 값이 없는 채로 빌드될 수 있으므로 전부 optional로 둔다.
 */
interface ImportMetaEnv {
  /** API 서버 주소. axiosInstance baseURL·토큰 재발급·카카오 인증 리다이렉트에 쓰인다 */
  readonly VITE_API_BASE_URL?: string;

  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  readonly VITE_ENABLE_FIREBASE_ANALYTICS?: string;
  readonly VITE_ENABLE_META_PIXEL?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_ANALYTICS_ENV?: 'local' | 'staging' | 'production';
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  /** 'true'면 로컬(DEV)에서도 Sentry로 실제 전송한다 (기본은 dry-run) */
  readonly VITE_SENTRY_FORCE_ENABLE?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_CURATION_OUTBOUND_UTM_QUERY?: string;
}

declare const __APP_VERSION__: string;

declare module '*.lottie' {
  const src: string;
  export default src;
}

interface Window {
  fbq?: (command: 'track', eventName: 'CompleteRegistration') => void;
}
