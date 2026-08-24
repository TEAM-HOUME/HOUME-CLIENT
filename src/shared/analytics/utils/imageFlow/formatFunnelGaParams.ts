import { ACTIVITY_CHIP, type ActivityChip } from '@analytics/params/imageSetup';
import {
  LOAD_PREFERENCE_TYPE,
  RESULT_PREFERENCE_TYPE,
  type LoadPreferenceType,
  type ResultPreferenceType,
} from '@analytics/params/result';
import { SHEET_EXPANSION_STATUS } from '@analytics/params/shop';

import type { FurnitureCategoryGroup } from '@apis/__generated__/data-contracts';

// ── activity_chip ─────────────────────────────────────────────

const ACTIVITY_CODE_TO_CHIP: Record<string, ActivityChip> = {
  // API v2 activity.code
  REMOTE_WORK: ACTIVITY_CHIP.WORK_REMOTE,
  READING: ACTIVITY_CHIP.READING,
  FLOOR_LIVING: ACTIVITY_CHIP.SEDENTARY,
  HOME_CAFE: ACTIVITY_CHIP.HOME_CAFE,
  // GA 스펙 snake_case (레거시/스냅샷 호환)
  default: ACTIVITY_CHIP.DEFAULT,
  work_remote: ACTIVITY_CHIP.WORK_REMOTE,
  reading: ACTIVITY_CHIP.READING,
  sedentary: ACTIVITY_CHIP.SEDENTARY,
  home_cafe: ACTIVITY_CHIP.HOME_CAFE,
};

export const mapActivityCodeToChip = (code: string): ActivityChip =>
  ACTIVITY_CODE_TO_CHIP[code] ?? ACTIVITY_CHIP.DEFAULT;

// ── moodBoard_ids / furniture_chips ─────────────────────────

export const buildMoodboardIdsParam = (ids: number[]): string => ids.join(', ');

export const buildSelectedFurnitureChips = (
  furnitureIds: number[],
  categories: FurnitureCategoryGroup[] | undefined
): string | undefined => {
  if (!categories?.length || furnitureIds.length === 0) return undefined;

  const codes: string[] = [];
  for (const category of categories) {
    for (const furniture of category.furnitures ?? []) {
      if (
        furniture.id != null &&
        furnitureIds.includes(furniture.id) &&
        furniture.code
      ) {
        codes.push(furniture.code);
      }
    }
  }

  return codes.length > 0 ? codes.join(', ') : undefined;
};

// ── preference_type (loadImg / result) ────────────────────────

export const toLoadPreferenceType = (isLike: boolean): LoadPreferenceType =>
  isLike ? LOAD_PREFERENCE_TYPE.PREFERRED : LOAD_PREFERENCE_TYPE.NON_PREFERRED;

export const toResultPreferenceType = (
  isLike: boolean
): ResultPreferenceType =>
  isLike
    ? RESULT_PREFERENCE_TYPE.PREFERRED
    : RESULT_PREFERENCE_TYPE.NON_PREFERRED;

// ── sheet_expansion_status (shop) ─────────────────────────────

export const toSheetExpansionStatus = (
  expanded: boolean,
  collapsed = false
) => {
  if (expanded) return SHEET_EXPANSION_STATUS.EXPANDED;
  if (collapsed) return SHEET_EXPANSION_STATUS.COLLAPSED;
  return SHEET_EXPANSION_STATUS.DEFAULT;
};
