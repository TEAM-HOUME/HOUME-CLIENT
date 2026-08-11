import ActionButton from '@components/button/actionButton/ActionButton';
import ErrorIllustration from '@components/errorFallback/ErrorIllustration';

import * as styles from './AppErrorFallback.css';

export default function AppErrorFallback() {
  const handleGoToHome = () => {
    // AppErrorFallback 렌더링 시 앱 전체가 crash 상태이므로 React Router의 navigate 사용 불가
    window.location.href = '/';
  };
  return (
    <main className={styles.contentWrapper}>
      <section className={styles.textSection}>
        <h1 className={styles.headerText}>문제가 발생했어요</h1>
        <p className={styles.bodyText}>
          일시적인 오류가 발생했어요. <br />
          잠시 후 다시 시도해주세요.
        </p>
      </section>

      <section className={styles.imgSection}>
        <ErrorIllustration />
      </section>

      {/* App-level crash 발생 시 앱 전체가 불안정한 상황 -> '다시 시도'보다는 '홈으로 돌아가기'가 적절*/}
      <section className={styles.buttonSection}>
        <ActionButton size="2XL" fullWidth onClick={handleGoToHome}>
          홈으로 돌아가기
        </ActionButton>
      </section>
    </main>
  );
}
