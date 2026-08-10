import type { ToastType } from '@shared/types/toast';

import * as styles from './Toast.css';
import Icon from '../icon/Icon';

interface ToastProps {
  text: string;
  type?: Exclude<ToastType, 'action'>;
  hasIcon?: boolean;
}

const Toast = ({ text, type = 'info', hasIcon = true }: ToastProps) => {
  const isError = type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={styles.container({ type })}
    >
      {isError && hasIcon ? <Icon name="CloseFillDanger" size="20" /> : null}
      <span className={styles.message({ type: 'default' })}>{text}</span>
    </div>
  );
};

export default Toast;
