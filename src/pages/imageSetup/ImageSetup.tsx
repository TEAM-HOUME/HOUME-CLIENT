import FunnelLayout from './components/layout/FunnelLayout';
import { useImageSetup } from './hooks/useImageGeneration';
import ActivityInfo from './pages/activityInfo/ActivityInfo';
import FloorPlan from './pages/floorPlan/FloorPlan';
import HouseInfo from './pages/houseInfo/HouseInfo';
import InteriorStyle from './pages/interiorStyle/InteriorStyle';
import {
  type CompletedFloorPlan,
  type CompletedInteriorStyle,
} from './types/funnel/steps';

import type { CompletedHouseInfo } from './types/funnel/houseInfo';

export const ImageSetup = () => {
  const funnel = useImageSetup();

  return (
    <FunnelLayout>
      <funnel.Render
        HouseInfo={funnel.Render.with({
          events: {
            selectHouseInfo: (data: CompletedHouseInfo, { history }) => {
              // Zustand가 데이터를 관리하므로 다음 스텝으로만 이동
              history.push('FloorPlan', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <HouseInfo
                context={context}
                onNext={(data) => dispatch('selectHouseInfo', data)}
              />
            );
          },
        })}
        FloorPlan={funnel.Render.with({
          events: {
            selectedFloorPlan: (data: CompletedFloorPlan, { history }) => {
              // Zustand가 데이터를 관리하므로 빈 객체 전달
              history.push('InteriorStyle', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <FloorPlan
                context={context}
                onNext={(data) => dispatch('selectedFloorPlan', data)}
              />
            );
          },
        })}
        InteriorStyle={funnel.Render.with({
          events: {
            selectInteriorStyle: (
              data: CompletedInteriorStyle,
              { history }
            ) => {
              // Zustand가 데이터를 관리하므로 빈 객체 전달
              history.push('ActivityInfo', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <InteriorStyle
                context={context}
                onNext={(data) => dispatch('selectInteriorStyle', data)}
              />
            );
          },
        })}
        ActivityInfo={funnel.Render.with({
          events: {},
          render({ context }) {
            return <ActivityInfo context={context} />;
          },
        })}
      />
    </FunnelLayout>
  );
};
