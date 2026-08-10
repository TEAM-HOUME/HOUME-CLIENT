import * as React from 'react';

import clsx from 'clsx';

import Icon, { type IconName, type IconSize } from '@components/icon/Icon';

import * as styles from './ActionButton.css';

export type ActionButtonVariant = 'solid' | 'outlined' | 'ghost';
export type ActionButtonColor = 'primary' | 'inverse';
export type ActionButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';

const BUTTON_SIZE_TO_ICON_SIZE: Record<ActionButtonSize, IconSize> = {
  // 각 버튼 size에 맞는 아이콘 size 맵핑
  XS: '14',
  S: '14',
  M: '16',
  L: '16',
  XL: '16',
  '2XL': '16',
};

export interface ActionButtonProps
  extends Omit<React.ComponentProps<'button'>, 'children' | 'width'> {
  children: React.ReactNode;
  variant?: ActionButtonVariant;
  color?: ActionButtonColor;
  size?: ActionButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
  visualDisabled?: boolean;
}

const ActionButton = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = '2XL',
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  disabled,
  visualDisabled = false,
  className,
  ...props
}: ActionButtonProps) => {
  const isDomDisabled = disabled === true;
  const isVisuallyDisabled = isDomDisabled || visualDisabled;
  const iconSize = BUTTON_SIZE_TO_ICON_SIZE[size];

  return (
    <button
      type={type}
      className={clsx(
        styles.button({
          variant,
          color,
          size,
          fullWidth,
          ...(isVisuallyDisabled ? { disabled: true } : {}),
        }),
        className
      )}
      disabled={isDomDisabled}
      aria-disabled={isDomDisabled || undefined}
      {...props}
    >
      {leftIcon != null ? <Icon name={leftIcon} size={iconSize} /> : null}
      <span className={styles.btnLabel({ size })}>{children}</span>
      {rightIcon != null ? <Icon name={rightIcon} size={iconSize} /> : null}
    </button>
  );
};

export default ActionButton;
