import * as styles from './TextHeading.css';

interface TextHeadingProps {
  type?: 'main' | 'sub' | 'popupModal' | 'bottomSheet';
  title: string;
  caption?: string;
}

const TextHeading = ({ type = 'main', title, caption }: TextHeadingProps) => {
  return (
    <div className={styles.wrapper({ type })}>
      <h2 className={styles.title({ type })}>{title}</h2>
      {caption && <p className={styles.caption({ type })}>{caption}</p>}
    </div>
  );
};

export default TextHeading;
