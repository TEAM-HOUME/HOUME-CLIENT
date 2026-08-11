import type {
  ColorFilterOption,
  FilterOption,
  FilterSectionKey,
} from '@pages/home/utils/productFilterUtils';

import Chip from '@components/chip/Chip';

import * as styles from './ProductFilterSheet.css';

interface ProductFilterSheetProps {
  furnitureOptions: FilterOption[];
  priceOptions: FilterOption[];
  colorOptions: ColorFilterOption[];
  isChipSelected: (section: FilterSectionKey, id: string) => boolean;
  onChipClick: (section: FilterSectionKey, id: string) => void;
}

const ProductFilterSheet = ({
  furnitureOptions,
  priceOptions,
  colorOptions,
  isChipSelected,
  onChipClick,
}: ProductFilterSheetProps) => {
  return (
    <div className={styles.root}>
      <section
        className={styles.section}
        aria-labelledby="filter-furniture-heading"
      >
        <h2 id="filter-furniture-heading" className={styles.sectionTitle}>
          카테고리
        </h2>
        <div className={styles.chipGroup} role="group" aria-label="카테고리">
          {furnitureOptions.map(({ id, label }, index) => (
            <Chip
              key={`furniture-${id}-${label}-${index}`}
              selected={isChipSelected('furniture', id)}
              onClick={() => onChipClick('furniture', id)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="filter-price-heading"
      >
        <h2 id="filter-price-heading" className={styles.sectionTitle}>
          가격대
        </h2>
        <div className={styles.chipGroup} role="group" aria-label="가격대">
          {priceOptions.map(({ id, label }, index) => (
            <Chip
              key={`price-${id}-${label}-${index}`}
              selected={isChipSelected('price', id)}
              onClick={() => onChipClick('price', id)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="filter-color-heading"
      >
        <h2 id="filter-color-heading" className={styles.sectionTitle}>
          색상
        </h2>
        <div className={styles.chipGroup} role="group" aria-label="색상">
          {colorOptions.map(({ id, label, value }, index) => (
            <Chip
              key={`color-${id}-${label}-${index}`}
              selected={isChipSelected('color', id)}
              onClick={() => onChipClick('color', id)}
            >
              {value ? (
                <span className={styles.colorChipInner}>
                  <span
                    className={styles.colorDot}
                    style={{
                      backgroundColor: value,
                    }}
                  />
                  {label}
                </span>
              ) : (
                label
              )}
            </Chip>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductFilterSheet;
