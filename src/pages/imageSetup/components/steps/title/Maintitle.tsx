import * as styles from '../StepCommon.css';

interface MainTitleProps {
  title: string;
  body?: string;
}

const MainTitle = ({ title, body }: MainTitleProps) => {
  return (
    <div className={styles.mainTextBox}>
      <span className={styles.title}>{title}</span>
      {body && <span className={styles.body}>{body}</span>}
    </div>
  );
};

export default MainTitle;
