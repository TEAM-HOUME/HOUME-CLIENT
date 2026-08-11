import { useEffect } from 'react';

import { useUserStore } from '@store/useUserStore';

import { useMyPageUserQuery } from '@apis/queries/useMyPageUserQuery';

/**
 * 사용자 정보를 전역 상태와 동기화하는 훅
 * 로그인된 사용자의 정보를 API에서 가져와서 전역 상태에 저장
 */
export const useUserSync = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const setUserName = useUserStore((state) => state.setUserName);
  const setUserId = useUserStore((state) => state.setUserId);
  const isLoggedIn = !!accessToken;

  const { data: userData } = useMyPageUserQuery({
    enabled: isLoggedIn,
  });

  // API에서 사용자 정보를 가져올 때 전역 상태에 userName, userId 동기화
  useEffect(() => {
    if (userData?.name) {
      setUserName(userData.name);
    }
    if (userData?.userId) {
      setUserId(userData.userId);
    }
  }, [userData?.name, userData?.userId, setUserName, setUserId]);

  return {
    userData,
    isLoggedIn,
  };
};
