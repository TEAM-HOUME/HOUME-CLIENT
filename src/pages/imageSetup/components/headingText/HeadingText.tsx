import * as styles from './HeadingText.css';

interface HeadingTextProps {
  title: string;
  body: string;
}

const HeadingText = ({ title, body }: HeadingTextProps) => {
  return (
    <div>
      <p className={styles.title}>{title}</p>
      <p className={styles.subtitle}>{body}</p>
    </div>
  );
};

export default HeadingText;
