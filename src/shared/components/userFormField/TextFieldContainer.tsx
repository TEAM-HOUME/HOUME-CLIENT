import type { ReactNode } from 'react';

import clsx from 'clsx';

import Icon from '@components/icon/Icon';

import * as styles from './TextFieldContainer.css';

interface TextFieldContainerProps {
  children: ReactNode;
  isFocused?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const TextFieldContainer = ({
  children,
  isFocused = false,
  isError = false,
  errorMessage,
}: TextFieldContainerProps) => {
  return (
    <div className={styles.fieldWrapper}>
      <div
        className={clsx(styles.fieldBox, isFocused && styles.focused, isError)}
      >
        {children}
      </div>

      {isError && errorMessage ? (
        <p className={styles.errorMessage}>
          <Icon name="WarningFillDanger" size="20" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export default TextFieldContainer;
