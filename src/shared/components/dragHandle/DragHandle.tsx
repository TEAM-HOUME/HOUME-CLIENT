import DragHandleIcon from '@/shared/assets/icons/dragHandle.svg?react';

import * as styles from './DragHandle.css';

const DragHandle = (props: React.ComponentProps<'div'>) => {
  return (
    <div className={styles.wrapper} {...props}>
      <DragHandleIcon />
    </div>
  );
};

export default DragHandle;
