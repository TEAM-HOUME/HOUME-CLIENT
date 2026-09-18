import type { ToasterProps } from 'sonner';

export const TOAST_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  ACTION: 'action',
} as const;

// 1) 키 타입
export type ToastTypeKey = keyof typeof TOAST_TYPE;

// 2) 값 타입
export type ToastType = (typeof TOAST_TYPE)[ToastTypeKey];

// toast 위치 키
export const TOASTER_ID = {
  TOP_4: 'top-4',
  BOTTOM_8: 'bottom-8',
  BOTTOM_4: 'bottom-4',
} as const;

export type ToasterId = (typeof TOASTER_ID)[keyof typeof TOASTER_ID];

/**
 * 액션 버튼이 있는 토스트가 떠 있는 시간. 기본값(TOASTER_DEFAULTS.duration, 2초)은 버튼을 누르기에 짧다.
 * 비교 완료·실패·이미지 생성 가드 토스트가 쓴다
 */
export const TOAST_ACTION_DURATION_MS = 5_000;

// sonner의 Toaster 기본 설정
export const TOASTER_DEFAULTS = {
  visibleToasts: 1,
  closeButton: false,
  duration: 2000,
  expand: false, // hover시 확장
} satisfies Pick<
  ToasterProps,
  'visibleToasts' | 'closeButton' | 'duration' | 'expand'
>;

// 토스터 위치별 offset 설정
export const TOASTER_CONFIGS = [
  {
    id: TOASTER_ID.TOP_4,
    position: 'top-center',
    offset: { top: '4rem' },
  },
  {
    id: TOASTER_ID.BOTTOM_4,
    position: 'bottom-center',
    offset: { bottom: '4rem' },
  },
  {
    id: TOASTER_ID.BOTTOM_8,
    position: 'bottom-center',
    offset: { bottom: '8rem' },
  },
] as const;
