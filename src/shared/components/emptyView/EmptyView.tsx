import emptyImage from '@assets/v2/images/ImgEmpty.png';

import * as styles from './EmptyView.css';

interface EmptyViewProps {
  title: string;
  description?: string;
  imageAlt?: string;
}

const EmptyView = ({ title, description, imageAlt = '' }: EmptyViewProps) => {
  return (
    <div className={styles.root}>
      <img className={styles.image} src={emptyImage} alt={imageAlt} />
      <div className={styles.textContainer}>
        <p className={styles.title}>{title}</p>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default EmptyView;
