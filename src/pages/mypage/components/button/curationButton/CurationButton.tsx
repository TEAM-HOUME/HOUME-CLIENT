import ArrowRight from '@/shared/assets/icons/ArrowRight.svg';

import * as styles from './CurationButton.css';

interface CurationButtonProps extends React.ComponentProps<'button'> {}

const CurationButton = ({ ...props }: CurationButtonProps) => {
  return (
    <button type="button" className={styles.curationButton()} {...props}>
      <span style={styles.curationButtonText}>큐레이션 가구 보기</span>
      <img
        src={ArrowRight}
        alt="arrow right"
        style={styles.curationButtonIcon}
      />
    </button>
  );
};

export default CurationButton;
