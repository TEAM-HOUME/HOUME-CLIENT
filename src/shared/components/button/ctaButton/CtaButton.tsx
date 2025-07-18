import KakaoIcon from '@assets/icons/kakaoIcon.svg?react';
import * as styles from './CtaButton.css';

interface CtaButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  isActive?: boolean;
  typeVariant?: 'default' | 'kakao';
  buttonSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

const CtaButton = ({
  children,
  isActive = true,
  typeVariant = 'default',
  buttonSize = 'xlarge',
  ...props
}: CtaButtonProps) => {
  return (
    <div className={styles.buttonWrapper}>
      <button
        type="button"
        disabled={!isActive}
        aria-disabled={!isActive}
        className={styles.CtaButton({
          state: isActive ? 'active' : 'disabled',
          type: typeVariant,
          buttonSize: buttonSize,
        })}
        {...props}
      >
        {typeVariant === 'kakao' ? (
          <span className={styles.kakaoContent}>
            <KakaoIcon className={styles.kakaoIcon} />
            <span className={styles.kakaoText}>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    </div>
  );
};

export default CtaButton;
