import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';

import BackIcon from '@shared/assets/icons/backIcon.svg?react';

import * as btnStyles from './NavBtn.css';
import * as styles from './TitleNavBar.css';

interface TitleNavBarProps extends React.ComponentProps<'nav'> {
  title: string;
  isBackIcon?: boolean;
  isLoginBtn?: boolean;
  isSettingBtn?: boolean;
  onBackClick?: () => void;
}

const TitleNavBar = ({
  title,
  isBackIcon = true,
  isLoginBtn = false,
  isSettingBtn = false,
  onBackClick,
  ...props
}: TitleNavBarProps) => {
  const navigate = useNavigate();

  return (
    <nav className={styles.container} {...props}>
      <div className={styles.leftdiv}>
        {isBackIcon && (
          <BackIcon
            onClick={onBackClick || (() => navigate(-1))}
            className={styles.backicon}
            aria-label="뒤로가기"
          />
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
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
        {isSettingBtn && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.SETTING)}
            className={btnStyles.settingNav}
          >
            설정
          </button>
        )}
      </div>
    </nav>
  );
};

export default TitleNavBar;
