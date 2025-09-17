import React from 'react';

import DislikeIconColor from '@assets/icons/dislikeColor.svg?react';
import DislikeIconGray from '@assets/icons/dislikeGray.svg?react';

import * as styles from './LikeButton.css';

interface DislikeButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  size?: 'small' | 'large';
  isSelected?: boolean;
}

const DislikeButton = ({
  children,
  size = 'large',
  isSelected = false,
  ...props
}: DislikeButtonProps) => {
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
      {isSelected ? <DislikeIconColor /> : <DislikeIconGray />}
      {children}
    </button>
  );
};

export default DislikeButton;
