import { useState } from 'react';
import Horizontal from '@assets/icons/horizontal.svg?react';
import clsx from 'clsx';
import * as styles from './FlipButton.css';

interface FilpButtonProps extends React.ComponentProps<'button'> {}

const FilpButton = ({ ...props }: FilpButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        styles.flipButtonBase,
        styles.flipButtonVariants[isClicked ? 'clicked' : 'normal']
      )}
      {...props}
    >
      <Horizontal />
    </button>
  );
};

export default FilpButton;
