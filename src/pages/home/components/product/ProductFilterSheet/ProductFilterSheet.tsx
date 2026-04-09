import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import Chip from '@components/v2/chip/Chip';

import * as styles from './ProductFilterSheet.css';

const FURNITURE_OPTIONS: { id: string; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'bed', label: '침대/프레임' },
  { id: 'desk', label: '업무용 책상' },
  { id: 'dining', label: '식탁' },
  { id: 'floorTable', label: '좌식 테이블' },
  { id: 'wardrobe', label: '옷장' },
  { id: 'storage', label: '수납/장식장' },
  { id: 'sofa', label: '소파' },
  { id: 'chair', label: '의자/스툴' },
  { id: 'vanity', label: '화장대/협탁' },
  { id: 'light', label: '조명' },
  { id: 'other', label: '그 외' },
];

const PRICE_OPTIONS: { id: string; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'under50k', label: '5만 원 이하' },
  { id: '50to100k', label: '5-10만 원' },
  { id: '10man', label: '10만 원대' },
  { id: '20man', label: '20만 원대' },
  { id: '30man', label: '30만 원대' },
  { id: '40man', label: '40만 원대' },
  { id: 'over50man', label: '50만 원 이상' },
];

const COLOR_OPTIONS: { id: string; label: string; dot?: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'white', label: '화이트', dot: '#FFFFFF' },
  { id: 'gray', label: '그레이', dot: '#8E959E' },
  { id: 'black', label: '블랙', dot: '#1B1E22' },
  { id: 'silver', label: '실버', dot: '#C8CDD2' },
  { id: 'gold', label: '골드', dot: '#D4AF37' },
  { id: 'beige', label: '베이지', dot: '#D4C4B0' },
  { id: 'brown', label: '브라운', dot: '#5C4033' },
  { id: 'red', label: '레드', dot: '#E53935' },
  { id: 'orange', label: '오렌지', dot: '#FB8C00' },
  { id: 'yellow', label: '옐로우', dot: '#FDD835' },
  { id: 'green', label: '그린', dot: '#43A047' },
  { id: 'blue', label: '블루', dot: '#1E88E5' },
  { id: 'navy', label: '네이비', dot: '#1A237E' },
  { id: 'violet', label: '바이올렛', dot: '#7E57C2' },
  { id: 'pink', label: '핑크', dot: '#EC407A' },
];

const ALL = 'ALL';

const INITIAL_SELECTION: string[] = [ALL];

/** 섹션 내 다중 선택: ALL만 있으면 ‘전체’, 그 외는 선택된 id 목록 */
function toggleSectionSelection(current: string[], id: string): string[] {
  if (id === ALL) {
    return [ALL];
  }
  const withoutAll = current.filter((x) => x !== ALL);
  const has = withoutAll.includes(id);
  const next = has ? withoutAll.filter((x) => x !== id) : [...withoutAll, id];
  return next.length === 0 ? [ALL] : next;
}

export interface ProductFilterValues {
  furnitureTypeIds: string[];
  priceRangeIds: string[];
  colorIds: string[];
}

export interface ProductFilterSheetRef {
  reset: () => void;
  getValues: () => ProductFilterValues;
  setValues: (values: ProductFilterValues) => void;
}

const ProductFilterSheet = forwardRef<ProductFilterSheetRef>(
  function ProductFilterSheet(_props, ref) {
    const [furnitureTypeIds, setFurnitureTypeIds] =
      useState<string[]>(INITIAL_SELECTION);
    const [priceRangeIds, setPriceRangeIds] =
      useState<string[]>(INITIAL_SELECTION);
    const [colorIds, setColorIds] = useState<string[]>(INITIAL_SELECTION);

    const reset = useCallback(() => {
      setFurnitureTypeIds([...INITIAL_SELECTION]);
      setPriceRangeIds([...INITIAL_SELECTION]);
      setColorIds([...INITIAL_SELECTION]);
    }, []);

    const getValues = useCallback((): ProductFilterValues => {
      return {
        furnitureTypeIds: [...furnitureTypeIds],
        priceRangeIds: [...priceRangeIds],
        colorIds: [...colorIds],
      };
    }, [furnitureTypeIds, priceRangeIds, colorIds]);

    const setValues = useCallback((values: ProductFilterValues) => {
      setFurnitureTypeIds(
        values.furnitureTypeIds.length > 0
          ? [...values.furnitureTypeIds]
          : [...INITIAL_SELECTION]
      );
      setPriceRangeIds(
        values.priceRangeIds.length > 0
          ? [...values.priceRangeIds]
          : [...INITIAL_SELECTION]
      );
      setColorIds(
        values.colorIds.length > 0
          ? [...values.colorIds]
          : [...INITIAL_SELECTION]
      );
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        reset,
        getValues,
        setValues,
      }),
      [reset, getValues, setValues]
    );

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
            {FURNITURE_OPTIONS.map(({ id, label }) => (
              <Chip
                key={id}
                selected={furnitureTypeIds.includes(id)}
                onClick={() =>
                  setFurnitureTypeIds((prev) =>
                    toggleSectionSelection(prev, id)
                  )
                }
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
            {PRICE_OPTIONS.map(({ id, label }) => (
              <Chip
                key={id}
                selected={priceRangeIds.includes(id)}
                onClick={() =>
                  setPriceRangeIds((prev) => toggleSectionSelection(prev, id))
                }
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
            {COLOR_OPTIONS.map(({ id, label, dot }) => (
              <Chip
                key={id}
                selected={colorIds.includes(id)}
                onClick={() =>
                  setColorIds((prev) => toggleSectionSelection(prev, id))
                }
              >
                {dot ? (
                  <span className={styles.colorChipInner}>
                    <span
                      className={styles.colorDot}
                      style={{
                        backgroundColor: dot,
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
  }
);

export default ProductFilterSheet;
