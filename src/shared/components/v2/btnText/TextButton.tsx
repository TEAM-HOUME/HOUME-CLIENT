import type { ComponentProps, ReactNode } from 'react';

import clsx from 'clsx';

import Icon, { type IconName } from '@shared/components/v2/icon/Icon';

import * as styles from './TextButton.css';

export type TextButtonColor = 'primary' | 'secondary' | 'inverse';
export type TextButtonSize = 's' | 'm';

const iconSizeForButton: Record<TextButtonSize, '16' | '20'> = {
  s: '16',
  m: '20',
};

export type TextButtonProps = Omit<
  ComponentProps<'button'>,
  'children' | 'type'
> & {
  color?: TextButtonColor;
  size?: TextButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
};

const TextButton = ({
  className,
  color = 'primary',
  size = 'm',
  leftIcon,
  rightIcon,
  children,
  ...rest
}: TextButtonProps) => {
  const iconSize = iconSizeForButton[size];

  return (
    <button
      type="button"
      className={clsx(styles.button({ color, size }), className)}
      {...rest}
    >
      {leftIcon != null ? (
        <span className={styles.iconSlot} aria-hidden>
          <Icon name={leftIcon} size={iconSize} />
        </span>
      ) : null}
      <span className={styles.textSlot}>{children}</span>
      {rightIcon != null ? (
        <span className={styles.iconSlot} aria-hidden>
          <Icon name={rightIcon} size={iconSize} />
        </span>
      ) : null}
    </button>
  );
};

export default TextButton;
