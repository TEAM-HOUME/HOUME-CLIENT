import FunnelLayout from './components/layout/FunnelLayout';
import { useImageSetup } from './hooks/useImageGeneration';
import ActivityInfo from './pages/activityInfo/ActivityInfo';
import FloorPlan from './pages/floorPlan/FloorPlan';
import HouseInfo from './pages/houseInfo/HouseInfo';
import InteriorStyle from './pages/interiorStyle/InteriorStyle';
import {
  type CompletedFloorPlan,
  type CompletedInteriorStyle,
  type ImageSetupSteps,
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
              history.replace('HouseInfo', data);
              // 각 스텝에서 context에서 사용자 입력값을 가져옴
              // -> 다음 스텝으로 넘어갈 때 기존 단계에서 선택한 값도 history에 push해야 뒤로가기 시에 데이터가 저장됨
              // 이때, history.push()는 브라우저 히스토리가 남으므로 history.replace()로 브라우저 히스토리가 남지 않도록 구현
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
              history.replace('FloorPlan', data);
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
              history.replace('InteriorStyle', data);
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
          events: {
            selectActivityInfo: (
              data: ImageSetupSteps['ActivityInfo'],
              { history }
            ) => {
              history.replace('ActivityInfo', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <ActivityInfo
                context={context}
                onContextChange={(data) => dispatch('selectActivityInfo', data)}
                // 마지막 단계에서는 다음 단계로 넘어가는 버튼이 별도로 존재하지 않으므로,
                // 버튼을 선택할 때마다 onContextChange로 history에 값을 push하도록 구현
              />
            );
          },
        })}
      />
    </FunnelLayout>
  );
};
