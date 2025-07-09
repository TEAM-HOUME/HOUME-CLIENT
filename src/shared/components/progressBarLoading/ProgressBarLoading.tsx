import * as styles from './ProgressBarLoading.css';
import startIcon from '@/shared/assets/icons/startIcon.svg';
import loadingIcon from '@/shared/assets/icons/loadingIcon.svg';
import completeIcon from '@/shared/assets/icons/completeIcon.svg';

export const ProgressBarLoading = () => {
  const icons = [startIcon, loadingIcon, completeIcon];

  return (
    <div className={styles.wrapper}>
      {icons.map((icon, index) => (
        <img key={index} src={icon} alt={`progress-${index + 1}`} />
      ))}
    </div>
  );
};
