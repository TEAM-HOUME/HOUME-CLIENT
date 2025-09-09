import type { JSX } from 'react';

import { TOAST_TYPE, type ToastType } from '@/shared/types/toast';

import WarningIcon from '@assets/icn_warning_toast.svg?react';

import * as styles from './Toast.css';

interface ToastProps {
  text: string;
  type: ToastType;
}

const ICON_MAP: Record<ToastType, JSX.Element> = {
  [TOAST_TYPE.SUCCESS]: <></>,
  [TOAST_TYPE.WARNING]: <WarningIcon />,
};

const Toast = ({ text, type }: ToastProps) => {
  return (
    <div className={styles.container}>
      {ICON_MAP[type]}
      <span className={styles.text}>{text}</span>
    </div>
  );
};

export default Toast;
