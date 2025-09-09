import { useCallback, useEffect, useRef } from 'react';

import { type Id, toast, type ToastOptions } from 'react-toastify';

import Toast from '@/shared/components/toast/Toast';
import { toastStyle, type ToastType } from '@/shared/types/toast';

interface UseToastParams {
  text: string;
  type?: ToastType;
  options?: ToastOptions;
  ariaLabel?: string;
  marginBottom?: string;
}

export const useToast = () => {
  const toastId = useRef<Id | null>(null);

  // 컴포넌트가 언마운트될 때 활성화된 토스트를 정리 -> 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (toastId.current !== null && toast.isActive(toastId.current)) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  const notify = useCallback(
    ({
      text,
      type = 'success',
      options,
      ariaLabel = '토스트 알림',
      marginBottom = '2rem',
    }: UseToastParams) => {
      // 1) 현재 toastId에 해당하는 toast가 떠있는지 확인, 떠있다면 해당 toast를 dismiss
      if (toastId.current !== null && toast.isActive(toastId.current)) {
        toast.dismiss(toastId.current);
      }

      // 2) 새 토스트를 띄우고, 반환된 ID를 저장
      toastId.current = toast(<Toast text={text} type={type} />, {
        ...options,
        ariaLabel: ariaLabel,
        style: {
          marginBottom: marginBottom,
          ...toastStyle,
          ...options?.style,
        },
      });
    },
    []
  );

  return { notify };
};
