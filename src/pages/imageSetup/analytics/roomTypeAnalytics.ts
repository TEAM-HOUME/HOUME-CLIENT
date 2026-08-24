import { FILTER_CATEGORIES } from '@pages/imageSetup/constants/floorPlanFilters';

import type { FloorPlanFilters } from '@shared/types/floorPlan';

import { GA_EVENTS } from '@analytics/events';
import {
  getScrollDepthFromElement,
  getScrollDepthFromWindow,
  scrollDepthParams,
} from '@analytics/params/scrollDepth';
import { SPACE_VIEW_TYPE, type SpaceViewType } from '@analytics/params/space';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { getEntryRoute } from '@analytics/utils/imageEntryRoute/readImageEntryRoute';
import { toSheetExpansionStatus } from '@analytics/utils/imageFlow/formatFunnelGaParams';
import { getReturnScreenNameFromImageEntry } from '@analytics/utils/imageFlow/resolveFunnelReturnScreen';
import { loginStatusParams } from '@analytics/utils/loginStatus';
import { getPreviousScreenName } from '@analytics/utils/screenName/updateScreenNameStack';
import { toAnalyticsNull } from '@analytics/utils/toAnalyticsNull';

import type {
  ExploreHouseTemplateDetailResponse,
  ExploreHouseTemplateItemResponse,
  RecentFloorPlanResponse,
} from '@apis/__generated__/data-contracts';

let roomTypeScrollElement: HTMLElement | null = null;

export const setRoomTypeScrollElement = (element: HTMLElement | null) => {
  roomTypeScrollElement = element;
};

const roomTypeScreenParams = () => ({
  screen_name: SCREEN_NAME.ROOM_TYPE,
});

const getFilterOptionLabel = (
  categoryId: keyof FloorPlanFilters,
  optionId: string
) =>
  FILTER_CATEGORIES.find(
    (category) => category.id === categoryId
  )?.options.find((option) => option.id === optionId)?.label;

const joinFilterLabels = (
  categoryId: keyof FloorPlanFilters,
  values: string[]
) => toAnalyticsNull(joinFilterLabelsRaw(categoryId, values));

const joinFilterLabelsRaw = (
  categoryId: keyof FloorPlanFilters,
  values: string[]
) =>
  values
    .map((value) => getFilterOptionLabel(categoryId, value))
    .filter(Boolean)
    .join(', ') || undefined;

export const getRoomTypeFilterParams = (appliedFilters: FloorPlanFilters) => ({
  filter_space_roomType: joinFilterLabels(
    'residenceType',
    appliedFilters.residenceType
  ),
  filter_space_struct: joinFilterLabels(
    'layoutType',
    appliedFilters.layoutType
  ),
  filter_space_size: joinFilterLabels(
    'equilibrium',
    appliedFilters.equilibrium
  ),
});

export const getRoomTypePreviousSpaceParams = (
  recentFloorPlan?: RecentFloorPlanResponse | null
) => ({
  has_previous_space: recentFloorPlan?.hasRecentImage === true,
  previous_space_id: toAnalyticsNull(recentFloorPlan?.floorPlanId),
  previous_space_name: toAnalyticsNull(recentFloorPlan?.floorPlanName),
});

export const getRoomTypePageViewParams = (
  recentFloorPlan?: RecentFloorPlanResponse | null
) => ({
  previous_screen_name: getPreviousScreenName(),
  ...getRoomTypePreviousSpaceParams(recentFloorPlan),
});

const getSpaceViewType = (viewCount: number): SpaceViewType =>
  viewCount > 1 ? SPACE_VIEW_TYPE.MULTI : SPACE_VIEW_TYPE.ONLY;

export const getRoomTypeSpaceCardParams = (
  plan: Pick<ExploreHouseTemplateItemResponse, 'id' | 'name'>
) => ({
  space_id: plan.id,
  space_name: plan.name,
});

export const getRoomTypeCardRoomClickParams = (
  plan: Pick<ExploreHouseTemplateItemResponse, 'id' | 'name'>,
  detail?: Pick<ExploreHouseTemplateDetailResponse, 'equilibrium'> | null
) => ({
  space_id: plan.id,
  space_name: plan.name,
  space_size: detail?.equilibrium,
});

export const getRoomTypeViewSheetViewParams = ({
  floorPlanId,
  floorPlanName,
  viewCount,
  sheetExpanded,
}: {
  floorPlanId: number;
  floorPlanName: string;
  viewCount: number;
  sheetExpanded: boolean;
}) => ({
  ...roomTypeScreenParams(),
  space_id: floorPlanId,
  space_name: floorPlanName,
  space_view_type: getSpaceViewType(viewCount),
  sheet_expansion_status: toSheetExpansionStatus(sheetExpanded),
});

const filterSheetParams = () => ({
  sheet_expansion_status: toSheetExpansionStatus(true),
});

export const trackRoomTypeCardRoomClick = (
  plan: Pick<ExploreHouseTemplateItemResponse, 'id' | 'name'>,
  detail?: Pick<ExploreHouseTemplateDetailResponse, 'equilibrium'> | null
) => {
  trackEvent(GA_EVENTS.roomType.CARD_ROOM_CLICK, {
    ...roomTypeScreenParams(),
    ...getRoomTypeCardRoomClickParams(plan, detail),
  });
};

export const trackRoomTypeEmptyListRecCardClick = (
  plan: Pick<ExploreHouseTemplateItemResponse, 'id'>,
  appliedFilters: FloorPlanFilters,
  {
    spaceCount,
    alternativeSpaceIds,
  }: { spaceCount: number; alternativeSpaceIds: number[] }
) => {
  trackEvent(GA_EVENTS.roomType.EMPTY_LIST_REC_CARD_CLICK, {
    ...roomTypeScreenParams(),
    ...loginStatusParams(),
    ...getRoomTypeFilterParams(appliedFilters),
    space_count: spaceCount,
    space_id: plan.id,
    alternative_space_ids:
      alternativeSpaceIds.length > 0
        ? alternativeSpaceIds.join(', ')
        : undefined,
  });
};

export const trackRoomTypeFilterSheetSubmit = (
  appliedFilters: FloorPlanFilters
) => {
  trackEvent(GA_EVENTS.roomType.FILTER_SHT_SUBMIT, {
    ...roomTypeScreenParams(),
    ...getRoomTypeFilterParams(appliedFilters),
    ...filterSheetParams(),
  });
};

export const trackRoomTypeFilterSheetReset = () => {
  trackEvent(GA_EVENTS.roomType.FILTER_SHT_RESET, filterSheetParams());
};

export const trackRoomTypeFilterSheetCloseClick = () => {
  trackEvent(GA_EVENTS.roomType.FILTER_SHT_CLOSE_CLICK, filterSheetParams());
};

export const trackRoomTypeFilterSheetDimmedClick = () => {
  trackEvent(GA_EVENTS.roomType.FILTER_SHT_DIMMED_CLICK, filterSheetParams());
};

export const trackRoomTypeListRoomCardView = (
  appliedFilters: FloorPlanFilters
) => {
  trackEvent(GA_EVENTS.roomType.LIST_ROOM_CARD_VIEW, {
    ...roomTypeScreenParams(),
    ...getRoomTypeFilterParams(appliedFilters),
  });
};

export const trackRoomTypeListEmptyView = (
  appliedFilters: FloorPlanFilters,
  {
    spaceCount,
    alternativeSpaceIds,
  }: { spaceCount: number; alternativeSpaceIds: number[] }
) => {
  trackEvent(GA_EVENTS.roomType.LIST_EMPTY_VIEW, {
    ...roomTypeScreenParams(),
    ...loginStatusParams(),
    ...getRoomTypeFilterParams(appliedFilters),
    space_count: spaceCount,
    alternative_space_ids:
      alternativeSpaceIds.length > 0
        ? alternativeSpaceIds.join(', ')
        : undefined,
  });
};

export const trackRoomTypeEmptyListRecCardView = (
  appliedFilters: FloorPlanFilters,
  {
    spaceCount,
    alternativeSpaceIds,
    spaceId,
  }: { spaceCount: number; alternativeSpaceIds: number[]; spaceId?: number }
) => {
  trackEvent(GA_EVENTS.roomType.EMPTY_LIST_REC_CARD_VIEW, {
    ...roomTypeScreenParams(),
    ...loginStatusParams(),
    ...getRoomTypeFilterParams(appliedFilters),
    space_count: spaceCount,
    space_id: spaceId,
    alternative_space_ids:
      alternativeSpaceIds.length > 0
        ? alternativeSpaceIds.join(', ')
        : undefined,
  });
};

export const trackRoomTypeViewSheetView = (params: {
  floorPlanId: number;
  floorPlanName: string;
  viewCount: number;
}) => {
  trackEvent(
    GA_EVENTS.roomType.VIEW_SHT_VIEW,
    getRoomTypeViewSheetViewParams({ ...params, sheetExpanded: true })
  );
};

export const trackRoomTypeViewSheetArrowRightClick = () => {
  trackEvent(
    GA_EVENTS.roomType.VIEW_SHT_ARROW_RIGHT_CLICK,
    filterSheetParams()
  );
};

export const trackRoomTypeViewSheetArrowLeftClick = () => {
  trackEvent(GA_EVENTS.roomType.VIEW_SHT_ARROW_LEFT_CLICK, filterSheetParams());
};

export const trackRoomTypeViewSheetFlipClick = () => {
  trackEvent(GA_EVENTS.roomType.VIEW_SHT_FLIP_CLICK, filterSheetParams());
};

export const trackRoomTypeViewSheetSubmit = ({
  floorPlanId,
  floorPlanName,
  floorPlanView,
  equilibrium,
  recentFloorPlan,
}: {
  floorPlanId: number;
  floorPlanName: string;
  floorPlanView: string;
  equilibrium?: string;
  recentFloorPlan?: RecentFloorPlanResponse | null;
}) => {
  trackEvent(GA_EVENTS.roomType.VIEW_SHT_SUBMIT, {
    ...roomTypeScreenParams(),
    ...loginStatusParams(),
    image_entry_route: getEntryRoute(),
    return_screen_name: getReturnScreenNameFromImageEntry(),
    space_id: floorPlanId,
    space_name: floorPlanName,
    space_view: floorPlanView,
    space_size: equilibrium,
    sheet_expansion_status: toSheetExpansionStatus(true),
    ...getRoomTypePreviousSpaceParams(recentFloorPlan),
  });
};

export const trackRoomTypeBtnBackClick = () => {
  const scrollDepth = roomTypeScrollElement
    ? getScrollDepthFromElement(roomTypeScrollElement)
    : getScrollDepthFromWindow();

  trackEvent(GA_EVENTS.roomType.BTN_BACK_CLICK, {
    ...roomTypeScreenParams(),
    ...scrollDepthParams(scrollDepth),
  });
};

export const trackRoomTypeMdResetInfoView = () => {
  trackEvent(GA_EVENTS.roomType.MD_RESET_INFO_VIEW);
};
