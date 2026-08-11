import { useState } from 'react';

import type { ActivityWithFurnitureResponse } from '@apis/__generated__/data-contracts';

import DragHandleBottomSheet from '@components/bottomSheet/DragHandleBottomSheet';
import ActionButton from '@components/button/actionButton/ActionButton';
import Icon from '@components/icon/Icon';
import TextHeading from '@components/textHeading/TextHeading';

import { getActivityIconName } from './activityIcons';
import * as styles from './ActivityTypeSheet.css';

interface ActivityTypeSheetProps {
  open: boolean;
  activities: ActivityWithFurnitureResponse[];
  selectedActivityCode?: string;
  onActivityChipClick: (activityCode: string) => void;
  onConfirm: (activityCode: string) => void;
  onClose: () => void;
}

const ActivityTypeSheet = ({
  open,
  activities,
  selectedActivityCode,
  onActivityChipClick,
  onConfirm,
  onClose,
}: ActivityTypeSheetProps) => {
  // 로컬 선택 상태 (확인 버튼 클릭 전까지 context에 미반영)
  const [localSelected, setLocalSelected] = useState<string | undefined>(
    selectedActivityCode
  );

  const handleConfirm = () => {
    if (!localSelected) return;
    onConfirm(localSelected);
  };

  return (
    <DragHandleBottomSheet
      open={open}
      onDismiss={onClose}
      contentSlot={
        <div className={styles.contents}>
          <TextHeading
            type="sub"
            title="주요 활동"
            caption="선택한 활동에 필요한 가구와 함께 이미지를 생성해요."
          />
          <div className={styles.radioList}>
            {activities.map((activity) => {
              const isSelected = localSelected === activity.code;
              const iconName = getActivityIconName(
                activity.code!,
                isSelected ? 'black' : 'gray'
              );
              const requiredFurnitureLabel = activity.furnitures![0]?.label;

              return (
                <button
                  key={activity.code}
                  type="button"
                  className={styles.radioItem({ selected: isSelected })}
                  onClick={() => {
                    if (!activity.code) return;
                    setLocalSelected(activity.code);
                    onActivityChipClick(activity.code);
                  }}
                >
                  <div className={styles.radioContents}>
                    {iconName && <Icon name={iconName} size="20" />}
                    <span className={styles.radioLabel}>{activity.label}</span>
                    {requiredFurnitureLabel && (
                      <>
                        <span
                          className={styles.divider({ selected: isSelected })}
                        />
                        <span
                          className={styles.requiredLabel({
                            selected: isSelected,
                          })}
                        >
                          {requiredFurnitureLabel}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      }
      primaryButton={
        <ActionButton
          size="2XL"
          fullWidth
          disabled={!localSelected}
          onClick={handleConfirm}
        >
          선택하기
        </ActionButton>
      }
    />
  );
};

export default ActivityTypeSheet;
