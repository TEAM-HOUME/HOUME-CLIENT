import { useEffect } from 'react';

import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { useUserStore } from '@/store/useUserStore';

/**
 * 사용자 정보를 전역 상태와 동기화하는 훅
 * 로그인된 사용자의 정보를 API에서 가져와서 전역 상태에 저장
 */
export const useUserSync = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const setUserName = useUserStore((state) => state.setUserName);
  const isLoggedIn = !!accessToken;

  const { data: userData } = useMyPageUser({
    enabled: isLoggedIn,
  });

  // API에서 사용자 정보를 가져올 때 전역 상태에 userName 동기화
  useEffect(() => {
    if (userData?.name) {
      setUserName(userData.name);
    }
  }, [userData?.name, setUserName]);

  return {
    userData,
    isLoggedIn,
  };
};
