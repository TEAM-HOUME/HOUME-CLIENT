import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';

import LogoIcon from '@shared/assets/icons/logoIcon.svg?react';
import ProfileIcon from '@shared/assets/icons/profileIcon.svg?react';

import * as styles from './LogoNavBar.css';
import * as btnStyles from './NavBtn.css';

type ButtonType = 'login' | 'profile' | null;

interface LogoNavBarProps extends React.ComponentProps<'nav'> {
  buttonType?: ButtonType;
  onProfileClick?: () => void; // 프로필 버튼 클릭 시 실행할 콜백 (선택적)
}

const LogoNavBar = ({
  buttonType = null,
  onProfileClick,
  ...props
}: LogoNavBarProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate(ROUTES.MYPAGE);
    }
  };

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
          <button
            type="button"
            onClick={handleProfileClick}
            className={styles.profileicon}
          >
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
      {handleRenderBtn()}
    </nav>
  );
};

export default LogoNavBar;
