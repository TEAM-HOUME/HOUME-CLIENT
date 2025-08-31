import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  HousingOptionsResponse,
  HousingSelectionRequest,
  HousingSelectionResponse,
} from '../types/apis/houseInfo';
import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

// 주거 옵션 조회 (GET)
export const useHousingOptions = () => {
  return useQuery({
    queryKey: ['housing-options'],
    queryFn: () =>
      request<HousingOptionsResponse>({
        method: HTTPMethod.GET,
        url: API_ENDPOINT.IMAGE_SETUP.HOUSE_OPTIONS,
      }),
    // TODO: 캐싱 정책 통일할 것들 통일(주거 옵션, 무드보드, 도면 등)
    // staleTime: Infinity, // 정적 데이터이므로 무한 캐싱
    // gcTime: 1000 * 60 * 60 * 24, // 24시간 가비지 컬렉션
  });
};

// 주거 선택 전송 (POST)
export const useHousingSelection = () => {
  return useMutation({
    mutationFn: (requestData: HousingSelectionRequest) =>
      request<HousingSelectionResponse>({
        method: HTTPMethod.POST,
        url: API_ENDPOINT.IMAGE_SETUP.HOUSE_INFO,
        body: requestData,
      }),
    // onSuccess, onError 콜백은 훅 호출부에 구현
  });
};
