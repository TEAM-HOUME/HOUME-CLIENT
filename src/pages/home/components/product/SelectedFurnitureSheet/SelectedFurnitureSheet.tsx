import Icon from '@shared/components/v2/icon/Icon';

import * as styles from './SelectedFurnitureSheet.css';

interface SelectedFurnitureSheetProps {
  expanded: boolean;
  selectedCount?: number;
  maxCount?: number;
}

const SelectedFurnitureSheet = ({
  expanded,
  selectedCount = 0,
  maxCount = 6,
}: SelectedFurnitureSheetProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size="16" />
        <p className={styles.title}>선택한 상품</p>
        <span className={styles.count}>
          (<span className={styles.selectedCount}>{selectedCount}</span>/
          {maxCount})
        </span>
      </div>

      {expanded ? (
        <div className={styles.expandedGrid}>
          {Array.from({ length: maxCount }).map((_, index) => (
            <div key={index} className={styles.addCard}>
              <span className={styles.addCardContent} aria-hidden>
                <Icon name="PlusFill" size="20" />
                <p className={styles.addLabel}>상품 추가하기</p>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.compactRow} aria-label="선택한 가구 미리보기">
          {Array.from({ length: maxCount }).map((_, index) => (
            <div key={index} className={styles.compactSlot} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectedFurnitureSheet;
