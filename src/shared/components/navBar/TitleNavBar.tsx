import { useNavigate } from 'react-router';
import BackIcon from '@shared/assets/icons/backIcon.svg?react';
import * as styles from './TitleNavBar.css';
import * as btnStyles from './LoginNavBtn.css';
import { ROUTES } from '@/routes/paths';

interface TitleNavBarProps extends React.ComponentProps<'nav'> {
  title: string;
  isBackIcon?: boolean;
  isLoginBtn?: boolean;
}

const TitleNavBar = ({
  title,
  isBackIcon = true,
  isLoginBtn = true,
  ...props
}: TitleNavBarProps) => {
  const navigate = useNavigate();

  return (
    <nav className={styles.container} {...props}>
      <div className={styles.leftdiv}>
        {isBackIcon && (
          <BackIcon
            onClick={() => navigate(-1)}
            className={styles.backicon}
            aria-label="뒤로가기"
          />
        )}
      </div>
      <h1>{title}</h1>
      <div className={styles.rightdiv}>
        {isLoginBtn && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className={btnStyles.loginNav}
          >
            로그인
          </button>
        )}
      </div>
    </nav>
  );
};

export default TitleNavBar;
