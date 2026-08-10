import CloseBottomSheet from '@components/bottomSheet/CloseBottomSheet';
import ActionButton from '@components/button/actionButton/ActionButton';
import Chip from '@components/chip/Chip';

import * as styles from './FilterSheet.css';

import type { FilterCategory, FloorPlanFilters } from '../../types/floorPlan';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  onOverlayClose?: () => void;
  filterCategories: FilterCategory[];
  pendingFilters: FloorPlanFilters;
  onFilterChange: (key: keyof FloorPlanFilters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const FilterSheet = ({
  open,
  onClose,
  onOverlayClose,
  filterCategories,
  pendingFilters,
  onFilterChange,
  onApply,
  onReset,
}: FilterSheetProps) => {
  return (
    <CloseBottomSheet
      open={open}
      onClose={onClose}
      onOverlayClick={onOverlayClose}
      onCloseButtonClick={onClose}
      titleSlot={<p className={styles.title}>필터</p>}
      titleAlign="left"
      contentSlot={
        // content: 버튼 제외 필터칩 영역
        <div className={styles.content}>
          {filterCategories.map((category) => {
            const currentValues = pendingFilters[category.id];

            return (
              <div key={category.id} className={styles.section}>
                <p className={styles.sectionTitle}>{category.label}</p>
                <div className={styles.chipGroup}>
                  {category.options.map((option) => (
                    <Chip
                      key={option.id}
                      selected={
                        option.id === 'ALL'
                          ? currentValues.length === 0
                          : currentValues.includes(option.id)
                      }
                      onClick={() => onFilterChange(category.id, option.id)}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      }
      primaryButton={
        <ActionButton size="2XL" fullWidth onClick={onApply}>
          필터 적용하기
        </ActionButton>
      }
      secondaryButton={
        <ActionButton
          variant="outlined"
          color="inverse"
          size="2XL"
          leftIcon="Refresh"
          onClick={onReset}
        >
          초기화
        </ActionButton>
      }
    />
  );
};

export default FilterSheet;
