import * as styles from './DragHandle.css';
import DragHandleIcon from '@/shared/assets/icons/dragHandle.svg?react';

const DragHandle = () => {
  return (
    <div className={styles.wrapper}>
      <DragHandleIcon />
    </div>
  );
};

export default DragHandle;
