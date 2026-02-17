import { type ToastContentProps } from 'react-toastify';

import { TOAST_TYPE, type ToastType } from '@/shared/types/toast';

import WarningIcon from '@assets/icn_warning_toast.svg?react';

import * as styles from './Toast.css';

interface ToastProps {
  text: string;
  type: ToastType;
  onClick?: () => void;
  closeToast?: ToastContentProps['closeToast'];
  // react-toastify의 ToastContentProps로부터 closeToast 함수 가져옴 -> Toast 컴포넌트에서 closeToast 받아서 사용
  // 타입은 optional이지만 toast() 함수로 컴포넌트 렌더링 시 react-toastify는 무조건 closeToast 주입(그렇게 설계됨)
  // +) toast.dismiss(id): 토스트 컴포넌트 외부에서 닫기, closeToast(): 컴포넌트 내부에서 닫기
}

const TOAST_LAYOUT_STYLE = {
  width: 'min(calc(100vw - 3.2rem), 40.8rem)',
  maxWidth: '408px',
  height: '44px',
} as const;

const Toast = ({ text, type, onClick, closeToast }: ToastProps) => {
  const handleActionClick = () => {
    if (onClick) {
      onClick();
    }
    if (closeToast) {
      closeToast();
    }
  };

  const icon = type === TOAST_TYPE.WARNING ? <WarningIcon /> : null;

  return (
    <div className={styles.container} style={TOAST_LAYOUT_STYLE}>
      {icon}
      <span
        className={styles.text({
          type: type === TOAST_TYPE.NAVIGATE ? 'navigate' : undefined,
        })}
      >
        {text}
      </span>
      {onClick && (
        <button
          type="button"
          className={styles.action}
          onClick={handleActionClick}
        >
          보러가기
        </button>
      )}
    </div>
  );
};

export default Toast;
