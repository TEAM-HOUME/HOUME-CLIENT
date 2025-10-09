import WarningIcon from '@assets/icons/warningRed.svg?react';

import * as styles from './ErrorButton.css';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className={styles.messageWrapper}>
      <WarningIcon />
      <span className={styles.messageText}>{message}</span>
    </div>
  );
};

export default ErrorMessage;
