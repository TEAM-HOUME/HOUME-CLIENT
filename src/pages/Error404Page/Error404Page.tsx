import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';

import * as styles from '@pages/Error404Page/Error404Page.css.ts';

import ErrorImageGroup from './components/ErrorImageGroup';

const Error404Page = () => {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <main className={styles.contentWrapper}>
      <Helmet>
        <title>404 - 페이지를 찾을 수 없습니다</title>
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
        <ErrorImageGroup />
      </section>
      <section className={styles.buttonSection}>
        <CtaButton typeVariant="notFound" onClick={handleGoToHome}>
          홈으로 돌아가기
        </CtaButton>
      </section>
    </main>
  );
};

export default Error404Page;
