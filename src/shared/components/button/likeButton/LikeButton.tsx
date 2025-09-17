import LikeIconColor from '@assets/icons/likeColor.svg?react';
import LikeIconGray from '@assets/icons/likeGray.svg?react';

import * as styles from './LikeButton.css';
interface LikeButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  size?: 'small' | 'large';
  isSelected?: boolean;
}

const LikeButton = ({
  children,
  size = 'large',
  isSelected = false,
  ...props
}: LikeButtonProps) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={styles.likeButton({
        selected: isSelected,
        size,
      })}
      {...props}
    >
      {isSelected ? <LikeIconColor /> : <LikeIconGray />}
      {children}
    </button>
  );
};

export default LikeButton;
