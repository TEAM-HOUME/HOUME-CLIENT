import ActionButton from '@components/button/actionButton/ActionButton';
import ErrorIllustration from '@components/errorFallback/ErrorIllustration';

import * as styles from './FeatureErrorFallback.css';

import type { FallbackProps } from 'react-error-boundary';

export default function FeatureErrorFallback({
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <section className={styles.contentWrapper}>
      <div className={styles.textSection}>
        <h2 className={styles.headerText}>문제가 발생했어요</h2>
        <p className={styles.bodyText}>
          일시적인 오류가 발생했어요. <br />
          다시 시도해주세요.
        </p>
      </div>

      <div className={styles.imgSection}>
        <ErrorIllustration />
      </div>

      <div className={styles.buttonSection}>
        <ActionButton size="2XL" fullWidth onClick={resetErrorBoundary}>
          다시 시도
        </ActionButton>
      </div>
    </section>
  );
}
