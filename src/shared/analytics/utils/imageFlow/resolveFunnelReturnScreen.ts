import { ENTRY_ROUTE, RESULT_TYPE } from '@store/imageFlow/types';
import { useImageFlowStore } from '@store/useImageFlowStore';

import { SCREEN_NAME, type ScreenName } from '@shared/analytics/screenNames';

/** image_entry_route 기준 imageSetup 직전 화면 — image funnel `return_screen_name` */
export const getReturnScreenNameFromImageEntry = (): ScreenName | undefined => {
  const entryRoute = useImageFlowStore.getState().entryRoute;
  if (!entryRoute) return undefined;

  switch (entryRoute) {
    case ENTRY_ROUTE.GENERATE_BUTTON:
    case ENTRY_ROUTE.FLOOR_PLAN:
      return SCREEN_NAME.HOME;
    case ENTRY_ROUTE.HOME_BANNER:
      return SCREEN_NAME.BANNER_DETAIL;
    case ENTRY_ROUTE.STYLE_RESTYLE:
      return SCREEN_NAME.STYLE_DETAIL;
    case ENTRY_ROUTE.PRODUCT_SELECTION:
    case ENTRY_ROUTE.PRODUCT_REGENERATE:
      return SCREEN_NAME.SHOP;
    default:
      return undefined;
  }
};

/** loadImg `return_screen_name` — 이 생성 플로우가 도달할 결과 화면 */
export const getLoadImgReturnScreenName = (): ScreenName => {
  const resultType = useImageFlowStore.getState().resultType;

  if (resultType === RESULT_TYPE.PRODUCT) {
    return SCREEN_NAME.RESULT_LIST;
  }

  if (
    resultType === RESULT_TYPE.FULL_FUNNEL ||
    resultType === RESULT_TYPE.BANNER ||
    resultType === RESULT_TYPE.STYLE
  ) {
    return SCREEN_NAME.RESULT_REC;
  }

  return SCREEN_NAME.ROOM_TYPE;
};
