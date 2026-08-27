import { useUserStore } from '@store/useUserStore';

import { LOGIN_STATUS, type LoginStatus } from '@analytics/params/global';

/** 이벤트 스펙에 `login_status`가 있을 때 호출부에서 명시적으로 전달 */
export const getLoginStatus = (): LoginStatus => {
  const { accessToken } = useUserStore.getState();
  return accessToken ? LOGIN_STATUS.LOGGED_IN : LOGIN_STATUS.LOGGED_OUT;
};

export const loginStatusParams = () => ({
  login_status: getLoginStatus(),
});
