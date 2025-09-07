import DragHandleIcon from '@/shared/assets/icons/dragHandle.svg?react';

export const DragHandle = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.dragHandle}>
        <DragHandleIcon />
      </div>
    </div>
  );
};
