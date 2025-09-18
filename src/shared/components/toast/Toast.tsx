import type { JSX } from 'react';

import { TOAST_TYPE, type ToastType } from '@/shared/types/toast';

import WarningIcon from '@assets/icn_warning_toast.svg?react';

import * as styles from './Toast.css';

interface ToastProps {
  text: string;
  type: ToastType;
  onClick?: () => void;
}

const ICON_MAP: Record<ToastType, JSX.Element> = {
  [TOAST_TYPE.INFO]: <></>,
  [TOAST_TYPE.NAVIGATE]: <></>,
  [TOAST_TYPE.WARNING]: <WarningIcon />,
};

const Toast = ({ text, type, onClick }: ToastProps) => {
  return (
    <div className={styles.container}>
      {ICON_MAP[type]}
      <span
        className={styles.text({
          type: type === TOAST_TYPE.NAVIGATE ? 'navigate' : undefined,
        })}
      >
        {text}
      </span>
      {onClick && (
        <button type="button" className={styles.action} onClick={onClick}>
          보러가기
        </button>
      )}
    </div>
  );
};

export default Toast;
