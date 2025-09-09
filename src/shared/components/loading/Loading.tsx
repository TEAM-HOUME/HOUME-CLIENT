import React from 'react';

import * as styles from './Loading.css';

interface LoadingProps {
  text?: string;
  show?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = '로딩 중입니다',
  show = true,
}) => {
  if (!show) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <div className={styles.loadingText}>{text}</div>
      </div>
    </div>
  );
};

export default Loading;
