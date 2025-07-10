import * as styles from './HeadingText.css';

interface HeadingTextProps extends React.ComponentProps<'div'> {
  title: string;
  content: string;
}
const HeadingText = ({ title, content }: HeadingTextProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <h2 className={styles.content}>{content}</h2>
    </div>
  );
};

export default HeadingText;
