import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import * as styles from '@pages/notFound/NotFoundPage.css';

import { ROUTES } from '@routes/paths';

import ActionButton from '@components/button/actionButton/ActionButton';
import ErrorIllustration from '@components/errorFallback/ErrorIllustration';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <main className={styles.contentWrapper}>
      <Helmet>
        <title>404</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className={styles.textSection}>
        <h1 className={styles.headerText}>유효하지 않은 링크예요!</h1>
        <p className={styles.bodyText}>
          잘못된 URL 경로로 서비스에 진입했어요. <br />
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
};

export default NotFoundPage;
