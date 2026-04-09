import { useCallback, useRef, useState } from 'react';

import CloseBottomSheet from '@shared/components/v2/bottomSheet/CloseBottomSheet';
import DragHandleBottomSheet from '@shared/components/v2/bottomSheet/DragHandleBottomSheet';
import ActionButton from '@shared/components/v2/button/actionButton/ActionButton';

import IntroSection from './IntroSection/IntroSection';
import ProductFilterSheet, {
  type ProductFilterValues,
  type ProductFilterSheetRef,
} from './ProductFilterSheet/ProductFilterSheet';
import * as styles from './ProductTab.css';
import SearchSection, {
  type AppliedFilterChip,
  type ProductFilterChipCategory,
} from './SearchSection/SearchSection';
import SelectedFurnitureSheet from './SelectedFurnitureSheet/SelectedFurnitureSheet';

const INITIAL_CHIP_SELECTED: Record<ProductFilterChipCategory, boolean> = {
  furniture: false,
  price: false,
  color: false,
};

const ALL = 'ALL';

const FURNITURE_LABELS: Record<string, string> = {
  bed: '침대/프레임',
  desk: '업무용 책상',
  dining: '식탁',
  floorTable: '좌식 테이블',
  wardrobe: '옷장',
  storage: '수납/장식장',
  sofa: '소파',
  chair: '의자/스툴',
  vanity: '화장대/협탁',
  light: '조명',
  other: '그 외',
};

const PRICE_LABELS: Record<string, string> = {
  under50k: '5만 원 이하',
  '50to100k': '5-10만 원',
  '10man': '10만 원대',
  '20man': '20만 원대',
  '30man': '30만 원대',
  '40man': '40만 원대',
  over50man: '50만 원 이상',
};

const COLOR_LABELS: Record<string, string> = {
  white: '화이트',
  gray: '그레이',
  black: '블랙',
  silver: '실버',
  gold: '골드',
  beige: '베이지',
  brown: '브라운',
  red: '레드',
  orange: '오렌지',
  yellow: '옐로우',
  green: '그린',
  blue: '블루',
  navy: '네이비',
  violet: '바이올렛',
  pink: '핑크',
};

const INITIAL_FILTER_VALUES: ProductFilterValues = {
  furnitureTypeIds: [ALL],
  priceRangeIds: [ALL],
  colorIds: [ALL],
};

const buildSummaryLabel = (
  ids: string[],
  labels: Record<string, string>
): string | null => {
  const selected = ids.filter((id) => id !== ALL);
  if (selected.length === 0) return null;
  const first = labels[selected[0]] ?? selected[0];
  return selected.length === 1 ? first : `${first} 외 ${selected.length - 1}개`;
};

const buildAppliedFilterChips = (
  values: ProductFilterValues
): AppliedFilterChip[] => {
  const chips: AppliedFilterChip[] = [];

  const furnitureLabel = buildSummaryLabel(
    values.furnitureTypeIds,
    FURNITURE_LABELS
  );
  if (furnitureLabel) {
    chips.push({
      category: 'furniture',
      id: 'furniture-summary',
      label: furnitureLabel,
    });
  }

  const priceLabel = buildSummaryLabel(values.priceRangeIds, PRICE_LABELS);
  if (priceLabel) {
    chips.push({
      category: 'price',
      id: 'price-summary',
      label: priceLabel,
    });
  }

  const colorLabel = buildSummaryLabel(values.colorIds, COLOR_LABELS);
  if (colorLabel) {
    chips.push({
      category: 'color',
      id: 'color-summary',
      label: colorLabel,
    });
  }

  return chips;
};

const ProductTab = () => {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [chipSelected, setChipSelected] = useState<
    Record<ProductFilterChipCategory, boolean>
  >(INITIAL_CHIP_SELECTED);
  const [appliedFilterValues, setAppliedFilterValues] =
    useState<ProductFilterValues>(INITIAL_FILTER_VALUES);
  const [appliedFilterChips, setAppliedFilterChips] = useState<
    AppliedFilterChip[]
  >([]);
  const productFilterSheetRef = useRef<ProductFilterSheetRef>(null);

  const handleFilterChipClick = useCallback(
    (category: ProductFilterChipCategory) => {
      setChipSelected((prev) => {
        if (prev[category]) {
          queueMicrotask(() => {
            setFilterSheetOpen(false);
          });
          return { ...INITIAL_CHIP_SELECTED };
        }

        queueMicrotask(() => {
          setFilterSheetOpen(true);
        });
        return {
          furniture: category === 'furniture',
          price: category === 'price',
          color: category === 'color',
        };
      });
    },
    []
  );

  const handleFilterSheetClose = useCallback(() => {
    setFilterSheetOpen(false);
    setChipSelected({ ...INITIAL_CHIP_SELECTED });
  }, []);

  const handleFilterApply = useCallback(() => {
    const values = productFilterSheetRef.current?.getValues();
    if (values) {
      const nextValues: ProductFilterValues = {
        furnitureTypeIds: [...values.furnitureTypeIds],
        priceRangeIds: [...values.priceRangeIds],
        colorIds: [...values.colorIds],
      };

      setAppliedFilterValues(nextValues);
      setAppliedFilterChips(buildAppliedFilterChips(nextValues));
    }
    handleFilterSheetClose();
  }, [handleFilterSheetClose]);

  const handleRemoveAppliedChip = useCallback(
    (category: ProductFilterChipCategory, _id: string) => {
      const normalizedValues: ProductFilterValues = {
        furnitureTypeIds:
          category === 'furniture'
            ? [ALL]
            : [...appliedFilterValues.furnitureTypeIds],
        priceRangeIds:
          category === 'price' ? [ALL] : [...appliedFilterValues.priceRangeIds],
        colorIds:
          category === 'color' ? [ALL] : [...appliedFilterValues.colorIds],
      };

      setAppliedFilterValues(normalizedValues);
      setAppliedFilterChips(buildAppliedFilterChips(normalizedValues));
      productFilterSheetRef.current?.setValues(normalizedValues);
    },
    [appliedFilterValues]
  );

  return (
    <div className={styles.container}>
      <IntroSection />
      <SearchSection
        chipSelected={chipSelected}
        onFilterChipClick={handleFilterChipClick}
        appliedFilterChips={appliedFilterChips}
        onAppliedFilterChipRemove={handleRemoveAppliedChip}
      />

      <DragHandleBottomSheet
        open={!filterSheetOpen}
        collapsedHeight="24rem"
        onExpandedChange={setSheetExpanded}
        contentSlot={<SelectedFurnitureSheet expanded={sheetExpanded} />}
        primaryButton={
          <ActionButton
            size="2XL"
            fullWidth
            leftIcon="DoubleStar"
            onClick={() => {}}
          >
            이 상품들로 우리 집 꾸미기
          </ActionButton>
        }
      />

      <CloseBottomSheet
        open={filterSheetOpen}
        onClose={handleFilterSheetClose}
        titleAlign="left"
        titleSlot={<p className={styles.filterSheetTitle}>필터</p>}
        contentSlot={<ProductFilterSheet ref={productFilterSheetRef} />}
        secondaryButton={
          <ActionButton
            variant="outlined"
            color="inverse"
            size="2XL"
            leftIcon="Refresh"
            onClick={() => productFilterSheetRef.current?.reset()}
          >
            초기화
          </ActionButton>
        }
        primaryButton={
          <ActionButton size="2XL" fullWidth onClick={handleFilterApply}>
            필터 적용하기
          </ActionButton>
        }
      />
    </div>
  );
};

export default ProductTab;
