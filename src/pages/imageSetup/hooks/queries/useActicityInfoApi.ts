import { useMutation, useQueryClient } from '@tanstack/react-query';
import { selectHouseInfo } from '../../apis/HouseInfo';
import { type SelectHouseInfoRequest } from '../../types/apis/step1Api.types';

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
