import { useQuery } from '@tanstack/react-query';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getRandomNickname = async (): Promise<string> => {
  return request<string>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.ROTATE_NICKNAME,
  });
};

export const useRandomNicknameQuery = () => {
  return useQuery({
    queryKey: queryKeys.signup.randomNickname(),
    queryFn: () => getRandomNickname(),
    enabled: true,
    staleTime: 0, // 항상 새로운 닉네임을 받아오기 위해
  });
};
