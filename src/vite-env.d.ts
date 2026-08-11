/// <reference types="vite/client" />

interface ImportMetaEnv {
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
  readonly VITE_CURATION_DETECTION_MODE?: 'server' | 'client';
}

declare const __APP_VERSION__: string;

declare module '*.lottie' {
  const src: string;
  export default src;
}

interface Window {
  fbq?: (command: 'track', eventName: 'CompleteRegistration') => void;
}
