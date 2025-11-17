import clsx from 'clsx';

import Horizontal from '@assets/icons/horizontal.svg?react';

import * as styles from './FlipButton.css';

interface FlipProps extends React.ComponentProps<'button'> {
  isFlipped: boolean;
}

const Flip = ({ isFlipped, ...props }: FlipProps) => {
  return (
    <button
      type="button"
      className={clsx(
        styles.flipButtonBase,
        styles.flipButtonVariants[isFlipped ? 'clicked' : 'normal']
      )}
      {...props}
    >
      <Horizontal />
    </button>
  );
};

export default Flip;
