import { useQuery } from '@tanstack/react-query';

import type { DashboardCategoriesResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { STATIC_DATA_QUERY_OPTIONS } from '@constants/cache';
import { queryKeys } from '@constants/queryKey';

export const getFurnitureCategories =
  async (): Promise<DashboardCategoriesResponse> => {
    return request<DashboardCategoriesResponse>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.IMAGE_SETUP.FURNITURE_CATEGORIES,
    });
  };

export const useFurnitureCategoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.imageSetup.furnitureCategories(),
    queryFn: getFurnitureCategories,
    ...STATIC_DATA_QUERY_OPTIONS,
  });
};
