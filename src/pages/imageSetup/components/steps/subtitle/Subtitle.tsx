import * as styles from '../StepCommon.css';

interface SubtitleProps {
  subtitle: string;
  caption?: string;
  count?: number;
  maxCount?: number;
}

const Subtitle = ({
  subtitle,
  caption,
  count,
  maxCount = 4, // TODO: magic number
}: SubtitleProps) => {
  return (
    <div className={styles.subTextBox}>
      <span className={styles.subtitle}>{subtitle}</span>
      {caption && <span className={styles.caption}>{caption}</span>}
      {count != undefined && maxCount && (
        <span className={styles.caption}>
          (<span className={styles.count}>{count}</span>
          <span className={styles.slash}>/</span>
          {maxCount}개 선택)
        </span>
      )}
    </div>
  );
};

export default Subtitle;
