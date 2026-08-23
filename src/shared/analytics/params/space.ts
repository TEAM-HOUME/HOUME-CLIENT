import type { ShopFilterCategory } from '@analytics/params/shop';

/** 공간/도면 — space_view_type */
export const SPACE_VIEW_TYPE = {
  ONLY: 'only',
  MULTI: 'multi',
} as const;

export type SpaceViewType =
  (typeof SPACE_VIEW_TYPE)[keyof typeof SPACE_VIEW_TYPE];

/** 공간/도면, 필터 — filter_type */
export const FILTER_TYPE = {
  SHOP: 'shop',
  SPACE: 'space',
} as const;

export type SpaceFilterType = (typeof FILTER_TYPE)[keyof typeof FILTER_TYPE];

/** 공간 필터(shop|space) 또는 상품 탭 필터 칩(furniture|price|color) */
export type FilterType = SpaceFilterType | ShopFilterCategory;

/** 이전 이력 — previous_space_reuse */
export type PreviousSpaceReuse = boolean;

/** 공간/도면 파라미터 (DB 전송 값 위주) */
export interface SpaceParams {
  space_name?: string;
  space_id?: number;
  space_struct?: string;
  space_size?: string;
  space_view_type?: SpaceViewType;
  space_view?: string;
  space_count?: number;
  /** ex. "3, 15, 16" */
  alternative_space_ids?: string;
  has_previous_space?: boolean;
  previous_space_id?: number | null;
  previous_space_name?: string | null;
  previous_space_reuse?: PreviousSpaceReuse;
  filter_type?: FilterType;
  filter_space_roomType?: string | null;
  filter_space_struct?: string | null;
  filter_space_size?: string | null;
}
