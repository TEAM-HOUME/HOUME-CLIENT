import type { ActivityWithFurnitureResponse } from '@apis/__generated__/data-contracts';

import Icon from '@components/icon/Icon';

import { getActivityIconName } from './activityIcons';
import * as styles from './SelectTrigger.css';

interface SelectTriggerProps {
  selectedActivity?: ActivityWithFurnitureResponse;
  onClick: () => void;
}

const SelectTrigger = ({ selectedActivity, onClick }: SelectTriggerProps) => {
  const activityIconName = selectedActivity
    ? getActivityIconName(selectedActivity.code!, 'black')
    : null;
  const requiredFurnitureLabel = selectedActivity?.furnitures?.[0]?.label;

  return (
    <button type="button" className={styles.trigger} onClick={onClick}>
      <div className={styles.leftContainer}>
        {activityIconName && <Icon name={activityIconName} size="20" />}
        {selectedActivity ? (
          <div className={styles.labelContainer}>
            <span className={styles.selectedLabel}>
              {selectedActivity.label}
            </span>
            {requiredFurnitureLabel && (
              <>
                <span className={styles.divider} />
                <span className={styles.requiredLabel}>
                  {requiredFurnitureLabel}
                </span>
              </>
            )}
          </div>
        ) : (
          <span className={styles.placeholderLabel}>
            활동 형태를 선택해주세요
          </span>
        )}
      </div>
      <Icon name="ChevronDownFill" size="20" />
    </button>
  );
};

export default SelectTrigger;
