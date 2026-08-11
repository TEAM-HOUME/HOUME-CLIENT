import { useEffect } from 'react';

import * as Sentry from '@sentry/react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import ActionButton from '@components/button/actionButton/ActionButton';
import ErrorIllustration from '@components/errorFallback/ErrorIllustration';

import * as styles from './RouteErrorFallback.css';

export default function RouteErrorFallback() {
  const error = useRouteError();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const message = isRouteErrorResponse(error)
    ? `${error.status} 오류가 발생했어요.`
    : '알 수 없는 오류가 발생했어요.';

  const handleGoToHome = () => {
    // 라우터 자체가 에러 상태이므로 React Router의 navigate 사용 X, '/'로 full reload 트리거
    window.location.href = '/';
  };

  return (
    <main className={styles.contentWrapper}>
      <section className={styles.textSection}>
        <h1 className={styles.headerText}>문제가 발생했어요</h1>
        <p className={styles.bodyText}>
          {message} <br />
          홈으로 돌아가 다시 시도해주세요.
        </p>
      </section>

      <section className={styles.imgSection}>
        <ErrorIllustration />
      </section>

      <section className={styles.buttonSection}>
        <ActionButton size="2XL" fullWidth onClick={handleGoToHome}>
          홈으로 돌아가기
        </ActionButton>
      </section>
    </main>
  );
}
