import * as styles from './FunnelHeader.css';
import type { ProgressStep } from '@/shared/components/progressBarKey/ProgressBarKey.types';
import ProgressBarKey from '@/shared/components/progressBarKey/ProgressBarKey';

interface FunnelHeaderProps {
  title: string;
  detail: string;
  currentStep: ProgressStep;
  image: string;
  size?: 'short' | 'long';
}

const FunnelHeader = ({
  title,
  detail,
  currentStep,
  image,
  size = 'long',
}: FunnelHeaderProps) => {
  return (
    <header
      className={styles.wrapper({
        size: size,
      })}
    >
      <div className={styles.container}>
        <div className={styles.headerWapper}>
          <div className={styles.progressWrapper}>
            <ProgressBarKey currentStep={currentStep} />
          </div>
          <div className={styles.textWrapper}>
            <span className={styles.title}>{title}</span>
            <span className={styles.detail}>{detail}</span>
          </div>
        </div>
        <div className={styles.imgWrapper}>
          <img src={image} alt="헤더 이미지" className={styles.image} />
        </div>
      </div>
    </header>
  );
};

export default FunnelHeader;
