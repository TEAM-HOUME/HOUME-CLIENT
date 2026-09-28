import { useEffect, useState } from 'react';

import * as styles from './CompareLoadingCard.css';
import {
  COMPARE_LOADING_MESSAGES,
  COMPARE_ROLL_INTERVAL_MS,
  getNextCompareLoadingCycle,
  type CompareLoadingStage,
} from './compareLoadingMessages';

interface CompareLoadingCardProps {
  stage: CompareLoadingStage;
}

const RollingMessage = ({ stage }: CompareLoadingCardProps) => {
  const [cycle, setCycle] = useState(0);
  const messages = COMPARE_LOADING_MESSAGES[stage];

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = window.setInterval(() => {
      setCycle(getNextCompareLoadingCycle);
    }, COMPARE_ROLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <span className={styles.rollingContent} key={cycle}>
      <span className={styles.message}>
        {messages[cycle % messages.length]}
      </span>
      <span className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
    </span>
  );
};

const CompareLoadingCard = ({ stage }: CompareLoadingCardProps) => (
  <div
    className={styles.container}
    role="status"
    aria-label="비슷한 상품 검색 중"
  >
    <RollingMessage key={stage} stage={stage} />
  </div>
);

export default CompareLoadingCard;
