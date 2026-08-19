import * as styles from './Toast.css';
import TextButton from '../btnText/TextButton';

interface ActionToastProps {
  text: string;
  actionLabel: string;
  ariaLabel?: string;
  onAction: () => void;
}

const ActionToast = ({
  text,
  actionLabel,
  ariaLabel,
  onAction,
}: ActionToastProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={styles.container({ type: 'action' })}
    >
      <span className={styles.message({ type: 'action' })}>{text}</span>
      <TextButton
        size="s"
        color="inverse"
        onClick={onAction}
        aria-label={ariaLabel || '버튼'}
        className={styles.actionButton}
      >
        {actionLabel}
      </TextButton>
    </div>
  );
};

export default ActionToast;
