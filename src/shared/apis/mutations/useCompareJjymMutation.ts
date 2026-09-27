import { useMutation } from '@tanstack/react-query';

import type { JjymToggleResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type { CompareJjymTarget } from '@utils/compareJjym';

import type { AxiosError } from 'axios';

export const postCompareJjym = async ({
  productId,
  source,
}: CompareJjymTarget): Promise<boolean> =>
  request<JjymToggleResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.COMPARE.JJYM(productId),
    query: { source },
  }).then((response) => response.favorited === true);

export const useCompareJjymMutation = () =>
  useMutation<boolean, AxiosError, CompareJjymTarget>({
    mutationKey: ['compareJjym'],
    mutationFn: postCompareJjym,
  });
