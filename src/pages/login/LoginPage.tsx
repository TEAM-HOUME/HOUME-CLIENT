import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import LoginBeforeImage from '@assets/icons/loginBefore.png';

import { KAKAO_AUTH_URL } from './constants/kakaoLoginPath';
import * as styles from './loginPage.css';
import { logLoginSocialClickBtnCTA } from './utils/analytics';

const LoginPage = () => {
  const handleKakaoLogin = () => {
    // CTA 버튼 클릭 시 GA 이벤트 전송
    logLoginSocialClickBtnCTA();

    // Firebase Analytics 이벤트 전송을 위한 지연 후 리다이렉트
    setTimeout(() => {
      window.location.href = KAKAO_AUTH_URL;
    }, 200);
  };

  return (
    <div className={styles.container}>
      <TitleNavBar
        title="회원가입/로그인"
        isBackIcon={false}
        isLoginBtn={false}
      />
      <div className={styles.textbox}>
        <h1 className={styles.title}>하우미와 나다운 집을 만들어가요!</h1>
        <p className={styles.content}>
          로그인하면 매번 집, 취향, 활동 정보를 입력할 필요없이 <br /> 스타일링
          결과를 저장하고 다시 볼 수 있어요.
        </p>
      </div>
      <div className={styles.imgbox}>
        <img
          src={LoginBeforeImage}
          alt="로그인 전 이미지"
          className={styles.loginImg}
          loading="lazy"
        />
      </div>
      <div className={styles.btnarea}>
        <CtaButton typeVariant="kakao" onClick={handleKakaoLogin}>
          카카오 로그인
        </CtaButton>
        <aside className={styles.aside}>
          가입 시{' '}
          <a
            href=""
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            서비스 약관
          </a>{' '}
          및{' '}
          <a
            href=""
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            개인정보처리방침
          </a>
          에 동의한 것으로 간주합니다.
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
