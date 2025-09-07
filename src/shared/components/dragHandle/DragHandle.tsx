import DragHandleIcon from '@/shared/assets/icons/dragHandle.svg?react';

import * as styles from './DragHandle.css.ts';

export const DragHandle = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.dragHandle}>
        <DragHandleIcon />
      </div>
    </div>
  );
};
