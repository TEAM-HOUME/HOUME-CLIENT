import type { FurnitureItem } from '@pages/mypage/types/apis/saveItemsList';

import { isCurationViewType } from '@store/imageFlow/flowConfig';

import { joinAnalyticsIds } from '@shared/analytics/params/builders/productCard';
import { IMG_RESULT_TYPE } from '@shared/analytics/params/result';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { getReturnScreenNameParams } from '@shared/analytics/utils/screenName';
import { toAnalyticsNull } from '@shared/analytics/utils/toAnalyticsNull';

import type {
  DateGroupResponse,
  ItemResponse,
} from '@apis/__generated__/data-contracts';

export const mypageScreenParams = () => ({
  screen_name: SCREEN_NAME.MYPAGE,
});

export const mypageReturnScreenParams = () =>
  getReturnScreenNameParams(SCREEN_NAME.HOME);

export const getMypageSavedItemsListParams = (
  items: Pick<FurnitureItem, 'rawProductId'>[] = []
) => {
  const savedItemIds =
    items
      .map((item) => item.rawProductId)
      .filter((id) => Number.isFinite(id))
      .join(', ') || undefined;

  return {
    saved_item_count: items.length,
    saved_item_ids: toAnalyticsNull(savedItemIds),
  };
};

export const getMypageGenImgListParams = (groups: DateGroupResponse[] = []) => {
  const items = groups.flatMap((group) => group.items ?? []);
  const mypage_img_count = items.filter((item) => item.imageId != null).length;
  const gen_img_ids = joinAnalyticsIds(
    items
      .filter((item) => item.imageId != null)
      .map((item) => ({ id: item.imageId as number }))
  );

  return {
    mypage_img_count,
    gen_img_ids: toAnalyticsNull(gen_img_ids),
  };
};

export const getMypageEmptyGenImgListParams = () => ({
  mypage_img_count: 0,
  gen_img_ids: null as null,
});

const mapViewTypeToImgResultType = (
  viewType?: ItemResponse['viewType']
): (typeof IMG_RESULT_TYPE)[keyof typeof IMG_RESULT_TYPE] | undefined => {
  if (viewType == null) return undefined;

  return isCurationViewType(viewType)
    ? IMG_RESULT_TYPE.RECOMMEND
    : IMG_RESULT_TYPE.LIST;
};

export const getMypageGenImgItemParams = (item: ItemResponse) => ({
  gen_img_id: item.imageId,
  gen_img_title: item.bannerTitle ?? item.productSummaryText ?? undefined,
  img_result_type: mapViewTypeToImgResultType(item.viewType),
});
