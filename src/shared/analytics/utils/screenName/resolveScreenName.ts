import { ROUTES } from '@routes/paths';

import { SCREEN_NAME, type ScreenName } from '@analytics/screenNames';

import { FUNNEL_ID } from '@constants/funnel';

const FUNNEL_STEP_PARAM = `${FUNNEL_ID}.step`;

const parsePathWithSearch = (pathWithSearch: string) => {
  const [pathname = ROUTES.HOME, search = ''] = pathWithSearch.split('?');
  const searchParams = new URLSearchParams(search);

  return {
    pathname: pathname || ROUTES.HOME,
    searchParams,
  };
};

/**
 * 경로(+쿼리) → screen_name
 *
 * `loginRedirect` 등 pathname+search 형태(`/?tab=product`)를 그대로 넘기면 됩니다.
 */
export const resolveScreenName = (
  pathWithSearch: string
): ScreenName | string => {
  const { pathname, searchParams } = parsePathWithSearch(pathWithSearch);

  if (pathname === ROUTES.HOME && searchParams.get('tab') === 'product') {
    return SCREEN_NAME.SHOP;
  }

  if (pathname === ROUTES.IMAGE_SETUP) {
    const step = searchParams.get(FUNNEL_STEP_PARAM);

    if (step === 'InteriorStyle') {
      return SCREEN_NAME.SELECT_MOODBOARD;
    }

    if (step === 'ActivityInfo') {
      return SCREEN_NAME.SELECT_FURNITURE;
    }

    return SCREEN_NAME.ROOM_TYPE;
  }

  if (pathname === ROUTES.GENERATE_RESULT) {
    const viewType = searchParams.get('viewType');

    if (viewType === 'PRODUCT') {
      return SCREEN_NAME.RESULT_LIST;
    }

    return SCREEN_NAME.RESULT_REC;
  }

  if (pathname === ROUTES.GENERATE) return SCREEN_NAME.LOAD_IMG;
  if (pathname === ROUTES.LANDING) return SCREEN_NAME.LANDING;
  if (pathname === ROUTES.LOGIN) return SCREEN_NAME.LOGIN_SOCIAL;
  if (pathname === ROUTES.SIGNUP) return SCREEN_NAME.SIGNUP_FORM;
  if (pathname === ROUTES.WELCOME) return SCREEN_NAME.SIGNUP_COMP;
  if (pathname === ROUTES.HOME) return SCREEN_NAME.HOME;
  if (pathname.startsWith(ROUTES.BANNER_DETAIL.replace('/:bannerId', '/'))) {
    return SCREEN_NAME.BANNER_DETAIL;
  }
  if (pathname === ROUTES.STYLE_LIST) return SCREEN_NAME.STYLE_LIST;
  if (pathname.startsWith(ROUTES.STYLE_DETAIL.replace('/:styleId', '/'))) {
    return SCREEN_NAME.STYLE_DETAIL;
  }
  if (pathname === ROUTES.SETTING_PROFILE_EDIT) return SCREEN_NAME.EDIT_PROFILE;
  if (pathname === ROUTES.SETTING_PRIVACY) return SCREEN_NAME.PRIVACY_POLICY;
  if (pathname === ROUTES.SETTING_SERVICE) return SCREEN_NAME.SERVICE_TERM;
  if (pathname === ROUTES.SETTING) return SCREEN_NAME.SETTING;
  if (pathname.startsWith(ROUTES.MYPAGE)) return SCREEN_NAME.MYPAGE;

  return pathname;
};
