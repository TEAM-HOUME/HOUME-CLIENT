import { useCallback } from 'react';

import { useRandomNicknameQuery } from '@apis/queries/useRandomNicknameQuery';

export const useRandomNickname = (
  onSuccess?: (newNickname: string) => void
) => {
  const { data: randomNickname, refetch } = useRandomNicknameQuery();

  const refresh = useCallback(async () => {
    try {
      const { data, isSuccess } = await refetch();

      if (isSuccess && data) {
        onSuccess?.(data);
        return data;
      }
    } catch (error) {
      console.error('닉네임 새로고침 실패:', error);
    }
  }, [onSuccess, refetch]);

  return {
    randomNickname,
    refresh,
  };
};
