import type { ProductFilterValues } from '@pages/home/hooks/useProductFilterState';
import type { AppliedFilterChip } from '@pages/home/types/productTab';
import { ALL_FILTER_SENTINEL } from '@pages/home/utils/productFilterUtils';

import {
  TRIGGER_CONTEXT,
  type TriggerContext,
} from '@shared/analytics/params/product';

const isAllFilter = (ids?: string[]) =>
  !ids?.length || (ids.length === 1 && ids[0] === ALL_FILTER_SENTINEL);

const hasActiveFilters = (
  appliedValues?: ProductFilterValues,
  appliedFilterChips?: AppliedFilterChip[]
) => {
  if (appliedFilterChips?.some((chip) => chip.applied)) {
    return true;
  }

  if (!appliedValues) {
    return false;
  }

  return (
    !isAllFilter(appliedValues.furnitureTypeIds) ||
    !isAllFilter(appliedValues.priceRangeIds) ||
    !isAllFilter(appliedValues.colorIds)
  );
};

export const resolveShopTriggerContext = ({
  searchKeyword,
  appliedValues,
  appliedFilterChips,
  isEmptyList,
}: {
  searchKeyword?: string;
  appliedValues?: ProductFilterValues;
  appliedFilterChips?: AppliedFilterChip[];
  isEmptyList?: boolean;
}): TriggerContext => {
  if (isEmptyList) {
    return TRIGGER_CONTEXT.EMPTY_RESULT;
  }

  const hasSearch = Boolean(searchKeyword?.trim());
  const hasFilter = hasActiveFilters(appliedValues, appliedFilterChips);

  if (hasSearch && hasFilter) {
    return TRIGGER_CONTEXT.SEARCH_FILTER_RESULT;
  }

  if (hasSearch) {
    return TRIGGER_CONTEXT.SEARCH_RESULT;
  }

  if (hasFilter) {
    return TRIGGER_CONTEXT.FILTER_RESULT;
  }

  return TRIGGER_CONTEXT.DEFAULT;
};
