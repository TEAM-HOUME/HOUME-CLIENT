import { useCallback, useRef } from 'react';

import { toast, type ExternalToast } from 'sonner';

import { TOAST_TYPE, type ToastType } from '@shared/types/toast';

import Toast from '@components/toast/Toast';

import ActionToast from './ActionToast';
import { toastStyle } from './Toast.css';

interface UseToastParams {
  text: string;
  type?: ToastType;
  hasIcon?: boolean;
  options?: ExternalToast;
  onClick?: () => void;
  actionLabel?: string;
  ariaLabel?: string;
}

export const useToast = () => {
  const toastId = useRef<string | number | null>(null);

  // 네비게이션 간 토스트 유지: 언마운트 시 자동 dismiss 제거
  const notify = useCallback(
    ({
      text,
      type = TOAST_TYPE.INFO,
      hasIcon,
      options,
      onClick,
      actionLabel,
      ariaLabel,
    }: UseToastParams) => {
      // 1) 현재 toastId에 해당하는 toast가 떠있는지 확인, 떠있다면 해당 toast를 dismiss
      if (toastId.current !== null) {
        toast.dismiss(toastId.current);
      }

      // 2) 새 토스트를 띄우고, 반환된 ID를 저장
      if (type === TOAST_TYPE.ACTION) {
        toastId.current = toast.custom(
          (id) => (
            <ActionToast
              text={text}
              actionLabel={actionLabel || ''}
              ariaLabel={ariaLabel}
              onAction={() => {
                onClick?.();
                toast.dismiss(id);
              }}
            />
          ),
          {
            ...options,
            style: {
              ...toastStyle,
              ...options?.style,
            },
          }
        );

        return;
      }

      toastId.current = toast.custom(
        () => <Toast text={text} type={type} hasIcon={hasIcon} />,
        {
          ...options,

          style: {
            ...toastStyle,
            ...options?.style,
          },
        }
      );
    },
    []
  );

  return { notify };
};
