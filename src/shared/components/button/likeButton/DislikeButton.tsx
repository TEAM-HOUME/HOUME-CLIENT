import React from 'react';

import DislikeIconColor from '@assets/icons/dislikeColor.svg?react';
import DislikeIconGray from '@assets/icons/dislikeGray.svg?react';

import * as styles from './LikeButton.css';

interface DislikeButtonProps extends React.ComponentProps<'button'> {
  children?: React.ReactNode;
  typeVariant?: 'withText' | 'onlyIcon';
  isSelected?: boolean;
  disabledd?: boolean;
}

const DislikeButton = ({
  children,
  typeVariant = 'withText',
  isSelected = false,
  disabled = false,
  ...props
}: DislikeButtonProps) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={styles.likeButton({
        selected: isSelected,
        type: typeVariant,
        disabled: disabled,
      })}
      {...props}
    >
      {isSelected ? <DislikeIconColor /> : <DislikeIconGray />}
      {children}
    </button>
  );
};

export default DislikeButton;
