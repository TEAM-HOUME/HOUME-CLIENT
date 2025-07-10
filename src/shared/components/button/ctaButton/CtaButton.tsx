import KakaoIcon from '@assets/icons/kakaoIcon.svg?react';
import * as styles from './CtaButton.css';

interface CtaButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  isActive?: boolean;
  typeVariant?: 'default' | 'kakao';
}

const CtaButton = ({
  children,
  isActive = true,
  typeVariant = 'default',
  ...props
}: CtaButtonProps) => {
  return (
    <button
      type="button"
      disabled={!isActive}
      aria-disabled={!isActive}
      className={styles.CtaButton({
        state: isActive ? 'active' : 'disabled',
        type: typeVariant,
      })}
      {...props}
    >
      {typeVariant === 'kakao' && <KakaoIcon />}
      {children}
    </button>
  );
};

export default CtaButton;
