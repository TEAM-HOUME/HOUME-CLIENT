import { useNavigate } from 'react-router-dom';

import TextButton from '@components/btnText/TextButton';

import { ROUTES } from '@/routes/paths';

import * as styles from './TitleNavBar.css';

export type TitleNavBarBackground = 'transparent' | 'primary' | 'gradient';
export type TitleNavBarPlacement = 'sticky' | 'overContent';

interface TitleNavBarProps extends React.ComponentProps<'nav'> {
  title?: string;
  backLabel?: string;
  isSettingBtn?: boolean;
  onBackClick?: () => void;
  onSettingClick?: () => void;
  background?: TitleNavBarBackground;
  placement?: TitleNavBarPlacement;
}

const TitleNavBar = ({
  title,
  backLabel,
  onBackClick,
  onSettingClick,
  isSettingBtn = false,
  background = 'primary',
  placement = 'sticky',
  ...props
}: TitleNavBarProps) => {
  const backAriaLabel = backLabel ?? '뒤로가기';
  const navigate = useNavigate();
  const displayTitle = title?.trim();

  // 그라데이션 배경은 이미지 위 오버레이용 → 뒤로가기 콘텐츠를 흰색(inverse)으로
  const isOnGradient = background === 'gradient';

  return (
    <nav className={styles.container({ background, placement })} {...props}>
      <div className={styles.leftSlot}>
        <TextButton
          color={isOnGradient ? 'inverse' : 'secondary'}
          size="m"
          aria-label={backAriaLabel}
          leftIcon={isOnGradient ? 'ArrowLeftStrokeWhite' : 'ArrowLeft'}
          onClick={onBackClick}
        >
          {backLabel}
        </TextButton>
      </div>
      {displayTitle ? <h1 className={styles.title}>{displayTitle}</h1> : null}
      <div className={styles.rightSlot}>
        {isSettingBtn && (
          <TextButton
            size="m"
            onClick={onSettingClick ?? (() => navigate(ROUTES.SETTING))}
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
