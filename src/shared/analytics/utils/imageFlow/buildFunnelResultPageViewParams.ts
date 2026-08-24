import { SCREEN_NAME } from '@analytics/screenNames';

import { getFlowAnalyticsSnapshot } from './captureFunnelInputSnapshot';
import {
  buildMoodboardIdsParam,
  mapActivityCodeToChip,
} from './formatFunnelGaParams';

export const buildResultRecPageViewParams = (genImgId: number) => {
  const snapshot = getFlowAnalyticsSnapshot();

  return {
    screen_name: SCREEN_NAME.RESULT_REC,
    gen_img_id: genImgId,
    space_id: snapshot?.floorPlanId,
    selected_moodBoard_ids: snapshot?.moodBoardIds?.length
      ? buildMoodboardIdsParam(snapshot.moodBoardIds)
      : undefined,
    selected_activity_chip: snapshot?.activityCode
      ? mapActivityCodeToChip(snapshot.activityCode)
      : undefined,
    selected_furniture_chips: snapshot?.furnitureChipCodes,
  };
};

export const buildResultListPageViewParams = (genImgId: number) => {
  const snapshot = getFlowAnalyticsSnapshot();

  return {
    screen_name: SCREEN_NAME.RESULT_LIST,
    gen_img_id: genImgId,
    selected_product_ids: snapshot?.productIds?.length
      ? snapshot.productIds.join(', ')
      : undefined,
  };
};
