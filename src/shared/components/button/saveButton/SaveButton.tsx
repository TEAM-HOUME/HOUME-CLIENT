import React from 'react';

import SaveOnIcon from '@assets/icons/icnHeartColor.svg?react';
import SaveOffIcon from '@assets/icons/icnHeartGray.svg?react';

import * as styles from './SaveButton.css';

interface SaveButtonProps extends React.ComponentProps<'button'> {
  isSelected: boolean;
  onClick: () => void;
}

const SaveButton = React.memo(
  ({ isSelected, onClick, ...props }: SaveButtonProps) => {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={styles.buttonWrapper}
        {...props}
      >
        {isSelected ? <SaveOnIcon /> : <SaveOffIcon />}
      </button>
    );
  }
);

export default SaveButton;
