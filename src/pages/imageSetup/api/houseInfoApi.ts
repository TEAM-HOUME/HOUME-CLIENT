import { useMutation, useQueryClient } from '@tanstack/react-query';

import { HTTPMethod, request, type RequestConfig } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

import type {
  SelectHouseInfoRequest,
  SelectHouseInfoResponse,
} from '../types/apis/houseInfo';

// API Functions
const selectHouseInfo = async (
  requestData: SelectHouseInfoRequest
): Promise<SelectHouseInfoResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.POST,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_INFO,
    body: requestData,
  };

  return await request<SelectHouseInfoResponse['data']>(config);
};

// Query Hooks
/**
 * 주거 정보 선택 API를 처리하는 커스텀 훅
 *
 * @returns useMutation 결과 객체
 *
 * @example
 * const { mutate } = useHouseInfoApi();
 * mutate({ houseType: 'apartment', roomType: 'oneRoom', areaType: 'small' });
 */
export const useHouseInfoApi = () => {
  const queryClient = useQueryClient();

  const selectHouseInfoRequest = useMutation({
    mutationFn: (houseInfo: SelectHouseInfoRequest) =>
      selectHouseInfo(houseInfo),
    onSuccess: () => {
      // API 요청 성공했을 때의 비즈니스 로직(유효한 주거정보인지 아닌지 분기처리)는
      // selectHouseInfoRequest의 mutate 시점에 처리함
      queryClient.invalidateQueries({ queryKey: ['houseInfo'] });
      queryClient.invalidateQueries({ queryKey: ['floorPlan'] });
    },
  });

  // 훅 내에서만 있는 지역변수들은 반드시 return 해야 외부에 노출됨
  return selectHouseInfoRequest;
};
