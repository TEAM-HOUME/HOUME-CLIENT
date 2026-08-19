import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import type { CurationProductListResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';
import type { RequestConfig } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys, type ProductListQueryVariables } from '@constants/queryKey';

const DEFAULT_PAGE_SIZE = 20;

const buildProductListQuery = (
  params: ProductListQueryVariables
): RequestConfig['query'] => {
  const query: RequestConfig['query'] = {};

  if (params.keyword) query['keyword'] = params.keyword;
  if (params.types && params.types.length > 0) query['types'] = params.types;
  if (params.priceRanges && params.priceRanges.length > 0) {
    query['priceRanges'] = params.priceRanges;
  }
  if (params.colors && params.colors.length > 0)
    query['colors'] = params.colors;
  if (params.cursor !== undefined) query['cursor'] = params.cursor;
  query['size'] = params.size ?? DEFAULT_PAGE_SIZE;

  return query;
};

export const getProductList = async (
  params: ProductListQueryVariables
): Promise<CurationProductListResponse> => {
  return request<CurationProductListResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.PRODUCT.LIST,
    query: buildProductListQuery(params),
  });
};

export const useProductListQuery = (params: ProductListQueryVariables) => {
  const normalizedParams = {
    ...params,
    size: params.size ?? DEFAULT_PAGE_SIZE,
  };

  const { cursor: _cursor, ...queryKeyParams } = normalizedParams;

  return useInfiniteQuery<
    CurationProductListResponse,
    Error,
    InfiniteData<CurationProductListResponse, number | undefined>,
    ReturnType<typeof queryKeys.product.productList>,
    number | undefined
  >({
    queryKey: queryKeys.product.productList(queryKeyParams),
    queryFn: ({ pageParam }) =>
      getProductList({
        ...queryKeyParams,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasNext) return undefined;
      return lastPage.meta.nextCursor;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
};
