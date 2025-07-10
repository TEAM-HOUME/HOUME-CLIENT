import WarningIcon from '@assets/icons/warningRed.svg?react';
import * as styles from './ShowErrorButton.css';

interface ShowErrorMessageProps {
  message: string;
}

const ShowErrorMessage = ({ message }: ShowErrorMessageProps) => {
  return (
    <div className={styles.messageWrapper}>
      <WarningIcon />
      <span className={styles.messageText}>{message}</span>
    </div>
  );
};

export default ShowErrorMessage;
