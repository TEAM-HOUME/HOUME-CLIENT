import type { ReactNode } from 'react';

import Arrow from '@assets/v2/svg/TooltipArrow.svg?react';

import IconButton from '@components/button/IconButton.tsx';

import * as styles from './Tooltip.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const Tooltip = ({ content, children, isOpen, onClose }: TooltipProps) => {
  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.tooltip} role="tooltip">
          <div className={styles.tooltipContent}>
            <span className={styles.message}>{content}</span>
            <IconButton
              name="Close"
              size="XXS"
              onClick={onClose}
              aria-label="툴팁 닫기"
            />
            <span className={styles.arrow}>
              <Arrow className={styles.arrowIcon} />
            </span>
          </div>
        </div>
      )}
      <div className={styles.trigger}>{children}</div>
    </div>
  );
};

export default Tooltip;
