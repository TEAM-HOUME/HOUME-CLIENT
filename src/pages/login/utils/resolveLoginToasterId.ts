import { ROUTES } from '@routes/paths';

import { TOASTER_ID, type ToasterId } from '@shared/types/toast';

import { HOME_TAB_PARAM } from '@constants/compareParams';

/**
 * 로그인 성공/실패 토스트의 표시 위치를 복귀 경로에 따라 결정한다.
 * 복귀 페이지에 하단 고정 바텀시트가 떠 있으면 상단(TOP_4)에,
 * 그 외에는 하단(BOTTOM_8)에 띄운다.
 *
 * 토스트는 navigate 직후 목적지 페이지 마운트 전에 동기적으로 실행되므로
 * 해당 페이지의 바텀시트 존재여부를 실시간으로 판단할 수 없음 -> 본 유틸에서 경로 문자열로 판단
 *   - 바텀시트가 떠있는 페이지로 복귀 -> TOP_4
 *   - 바텀시트가 없는 페이지로 복귀 -> BOTTOM_8
 */
export const resolveLoginToasterId = (redirectPath: string): ToasterId => {
  const [pathname, search = ''] = redirectPath.split('?', 2);

  if (pathname === ROUTES.IMAGE_SETUP) return TOASTER_ID.TOP_4;

  if (
    pathname === ROUTES.HOME &&
    new URLSearchParams(search).get(HOME_TAB_PARAM) === 'product'
  ) {
    return TOASTER_ID.TOP_4;
  }

  return TOASTER_ID.BOTTOM_8;
};
