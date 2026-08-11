import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

import * as styles from './Popup.css.ts';
import ActionButton from '../button/actionButton/ActionButton';
import IconButton from '../button/IconButton';
import Icon from '../icon/Icon';

import type { IconName } from '../icon/Icon';

export type PopupBtnStyle = 'text' | 'solid';
type PopupContainerSize = 'default' | 'creditRequest';

interface PopupProps {
  topIconName?: IconName;
  content?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
  btnStyle: PopupBtnStyle;
  btnText: string;
  weakBtnText?: string;
  btnIcon?: IconName;
  showCloseButton?: boolean;
  sideIconName?: IconName;
  ariaLabel?: string;
  confirmDisabled?: boolean;
  containerSize?: PopupContainerSize;
}

const Popup = ({
  topIconName,
  content,
  onCancel,
  onConfirm,
  onClose,
  btnStyle,
  btnText,
  weakBtnText,
  btnIcon,
  showCloseButton = false,
  sideIconName,
  ariaLabel,
  confirmDisabled = false,
  containerSize = 'default',
}: PopupProps) => {
  const hasWeak = weakBtnText != null && weakBtnText !== '';
  const [motion, setMotion] = useState<'opening' | 'open'>('opening');

  // 첫 프레임 hidden → rAF×2 후 open (enter transition 트리거)
  useLayoutEffect(() => {
    let raf2: number | null = null;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMotion('open'));
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const footer =
    btnStyle === 'text' ? (
      <div className={styles.buttonArea({ btnStyle: 'text' })}>
        {hasWeak ? (
          <button
            type="button"
            className={styles.textButton({ role: 'weak', layout: 'paired' })}
            onClick={onCancel}
          >
            {weakBtnText}
          </button>
        ) : null}
        <button
          type="button"
          className={styles.textButton({
            role: 'strong',
            layout: hasWeak ? 'paired' : 'single',
          })}
          disabled={confirmDisabled}
          aria-disabled={confirmDisabled || undefined}
          onClick={() => {
            if (confirmDisabled) return;
            onConfirm();
          }}
        >
          {btnText}
        </button>
      </div>
    ) : (
      <div className={styles.buttonArea({ btnStyle: 'solid' })}>
        {sideIconName ? (
          <IconButton
            name={sideIconName}
            size="M"
            className={styles.sideIconButton}
            onClick={onCancel}
          />
        ) : null}
        <div className={styles.primaryButtonWrap}>
          <ActionButton
            variant="solid"
            color="primary"
            size="L"
            leftIcon={btnIcon}
            fullWidth
            disabled={confirmDisabled}
            visualDisabled={confirmDisabled}
            onClick={() => {
              if (confirmDisabled) return;
              onConfirm();
            }}
          >
            {btnText}
          </ActionButton>
        </div>
      </div>
    );

  return (
    <div className={styles.viewportLayer}>
      <div
        className={styles.backdrop({ motion })}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={styles.container({ motion, containerSize })}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? '안내 팝업'}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton ? (
          <div className={styles.closeButton}>
            <IconButton
              name="CloseFillGray"
              size="M"
              aria-label="닫기"
              onClick={onClose}
            />
          </div>
        ) : null}
        <div className={styles.contentArea({ btnStyle })}>
          <div className={styles.slotBox}>
            {topIconName ? <Icon name={topIconName} size="32" /> : null}
            <div className={styles.body}>{content}</div>
          </div>
        </div>
        {footer}
      </div>
    </div>
  );
};

export default Popup;
