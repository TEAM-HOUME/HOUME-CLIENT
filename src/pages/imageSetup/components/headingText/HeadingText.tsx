import * as styles from './HeadingText.css';

interface HeadingTextProps {
  title: string;
  subtitle: string;
}

const HeadingText = ({ title, subtitle }: HeadingTextProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};

export default HeadingText;
