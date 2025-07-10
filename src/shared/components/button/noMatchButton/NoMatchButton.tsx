import WarningIconGray from '@assets/icons/warningGray.svg?react';
import ArrowRightIcon from '@assets/icons/ArrowRight.svg?react';
import * as styles from './NoMatchButton.css';

interface NoMatchButtonProps extends React.ComponentProps<'button'> {
  message: string;
}

const NoMatchButton = ({ message, ...props }: NoMatchButtonProps) => {
  return (
    <button className={styles.buttonWrapper} {...props}>
      <div className={styles.textContainer}>
        <WarningIconGray />
        <span className={styles.messageText}>{message}</span>
      </div>
      <ArrowRightIcon />
    </button>
  );
};

export default NoMatchButton;
