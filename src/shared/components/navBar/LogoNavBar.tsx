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
          <div
            className={styles.rightdiv}
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{ cursor: 'pointer' }}
          >
            <button type="button" className={btnStyles.loginNav}>
              로그인
            </button>
          </div>
        );
      case 'profile':
        return (
          <div className={styles.rightdiv}>
            <button
              type="button"
              onClick={() => navigate(ROUTES.MYPAGE)}
              className={styles.profileicon}
            >
              <ProfileIcon />
            </button>
          </div>
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
      {handleRenderBtn()}
    </nav>
  );
};

export default LogoNavBar;
