import { useLayoutEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { updateScreenNavigation } from '@analytics/utils/screenName/updateScreenNameStack';

/**
 * 라우트 변경 시 previous/current screen_name 갱신
 * RootLayout에서 1회 마운트
 */
export const useScreenNavigation = (): void => {
  const location = useLocation();

  useLayoutEffect(() => {
    const pathWithSearch = `${location.pathname}${location.search}`;
    updateScreenNavigation(pathWithSearch);
  }, [location.pathname, location.search]);
};
