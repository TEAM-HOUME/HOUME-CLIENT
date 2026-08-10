import clsx from 'clsx';

import { type IconName, type IconSize } from '../icon/Icon';
import Icon from '../icon/Icon';
import * as styles from '../icon/Icon.css';

export type IconButtonSize = 'XXS' | 'S' | 'M' | 'L' | 'XL';

const ICON_BUTTON_SIZE: Record<IconButtonSize, IconSize> = {
  XXS: '12',
  S: '20',
  M: '24',
  L: '32',
  XL: '40',
} as const;

export interface IconButtonProps
  extends Omit<React.ComponentProps<'button'>, 'children'> {
  name: IconName;
  size?: IconButtonSize;
}

const IconButton = ({
  name,
  size = 'S',
  type = 'button',
  className,
  disabled = false,
  ...props
}: IconButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(styles.iconButton({ size, disabled }), className)}
      disabled={disabled}
      {...props}
    >
      <Icon size={ICON_BUTTON_SIZE[size]} name={name} />
    </button>
  );
};

export default IconButton;
