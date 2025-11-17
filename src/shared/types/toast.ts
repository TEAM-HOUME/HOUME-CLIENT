import { Slide } from 'react-toastify';

import type { ToastContainerProps } from 'react-toastify';

export const TOAST_TYPE = {
  INFO: 'info',
  WARNING: 'warning',
  NAVIGATE: 'navigate',
} as const;

// 1) 키 타입: 'SUCCESS' | 'WARNING'
export type ToastTypeKey = keyof typeof TOAST_TYPE;

// 2) 값 타입: 'success' | 'warning'
export type ToastType = (typeof TOAST_TYPE)[ToastTypeKey];

export const toastStyle = {
  backgroundColor: 'transparent',
  boxShadow: 'none',
  display: 'flex',
  justifyContent: 'center',
};

export const toastConfig: ToastContainerProps = {
  position: 'bottom-center' as const,
  closeButton: false,
  autoClose: 3000,
  hideProgressBar: true,
  newestOnTop: true,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  limit: 1,
  toastStyle: {
    ...toastStyle,
  },
  transition: Slide,
};
