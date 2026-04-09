import { useNavigate } from 'react-router-dom';

import TextButton from '@components/v2/btnText/TextButton';

import { ROUTES } from '@/routes/paths';

import * as styles from './TitleNavBar.css';

interface TitleNavBarProps extends React.ComponentProps<'nav'> {
  title: string;
  backLabel?: string;
  isSettingBtn?: boolean;
  onBackClick?: () => void;
}

const TitleNavBar = ({
  title,
  backLabel,
  onBackClick,
  isSettingBtn = false,
  ...props
}: TitleNavBarProps) => {
  const backAriaLabel = backLabel ?? '뒤로가기';
  const navigate = useNavigate();

  return (
    <nav className={styles.container} {...props}>
      <div className={styles.leftSlot}>
        <TextButton
          color="secondary"
          size="m"
          aria-label={backAriaLabel}
          leftIcon="ArrowLeft"
          onClick={onBackClick}
        >
          {backLabel}
        </TextButton>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.rightSlot}>
        {isSettingBtn && (
          <TextButton
            size="m"
            onClick={() => navigate(ROUTES.SETTING)}
            aria-label="설정으로 이동"
          >
            설정
          </TextButton>
        )}
      </div>
    </nav>
  );
};

export default TitleNavBar;
