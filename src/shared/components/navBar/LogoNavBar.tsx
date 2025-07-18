import { useNavigate } from 'react-router-dom';
import LogoIcon from '@shared/assets/icons/logoIcon.svg?react';
import ProfileIcon from '@shared/assets/icons/profileIcon.svg?react';
import * as styles from './LogoNavBar.css';
import * as btnStyles from './LoginNavBtn.css';
import { ROUTES } from '@/routes/paths';

type ButtonType = 'login' | 'profile' | null;

interface LogoNavBarProps extends React.ComponentProps<'nav'> {
  buttonType?: ButtonType;
}

const LogoNavBar = ({ buttonType = null, ...props }: LogoNavBarProps) => {
  const navigate = useNavigate();

  const handleRenderBtn = () => {
    switch (buttonType) {
      case 'login':
        return (
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className={btnStyles.loginNav}
          >
            로그인
          </button>
        );
      case 'profile':
        return (
          <button type="button" onClick={() => navigate(ROUTES.MYPAGE)}>
            <ProfileIcon />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <nav className={styles.container} {...props}>
      <div className={styles.leftdiv}>
        <LogoIcon />
      </div>
      <div className={styles.rightdiv}>{handleRenderBtn()}</div>
    </nav>
  );
};

export default LogoNavBar;
