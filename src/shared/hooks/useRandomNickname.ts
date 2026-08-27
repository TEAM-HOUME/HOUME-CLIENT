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

    // 재요청이 실패했거나 빈 응답이면 호출자가 기존 닉네임을 유지하도록 undefined를 돌려준다
    return undefined;
  }, [onSuccess, refetch]);

  return {
    randomNickname,
    refresh,
  };
};
