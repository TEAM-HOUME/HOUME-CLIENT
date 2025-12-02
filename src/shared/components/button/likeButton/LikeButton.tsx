import LikeIconColor from '@assets/icons/likeColor.svg?react';
import LikeIconGray from '@assets/icons/likeGray.svg?react';

import * as styles from './LikeButton.css';
interface LikeButtonProps extends React.ComponentProps<'button'> {
  children?: React.ReactNode;
  typeVariant?: 'withText' | 'onlyIcon';
  isSelected?: boolean;
  disabled?: boolean;
}

const LikeButton = ({
  children,
  typeVariant = 'withText',
  isSelected = false,
  disabled = false,
  ...props
}: LikeButtonProps) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={styles.likeButton({
        type: typeVariant,
        selected: isSelected,
        disabled: disabled,
      })}
      {...props}
    >
      {isSelected ? <LikeIconColor /> : <LikeIconGray />}
      {children}
    </button>
  );
};

export default LikeButton;
