import * as styles from './ProgressBarLoading.css';

export type ProgressBarLoadingVariant = 'start' | 'loading' | 'complete';

interface ProgressBarLoadingProps {
  variant: ProgressBarLoadingVariant;
  text?: string;
}

const ProgressBarLoading = ({ variant, text }: ProgressBarLoadingProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.backgroundBar}>
        <div className={styles.fillVariants({ variant })} />
      </div>
      {text && <p className={styles.textWrapper}>{text}</p>}
    </div>
  );
};

export default ProgressBarLoading;
