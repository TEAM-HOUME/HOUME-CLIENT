import { useQuery } from '@tanstack/react-query';
import { getFloorPlan } from '../../apis/FloorPlan';

export const useFloorPlanApi = () => {
  const query = useQuery({
    queryKey: ['floorPlan'],
    queryFn: getFloorPlan,
  });

  return query;
};
