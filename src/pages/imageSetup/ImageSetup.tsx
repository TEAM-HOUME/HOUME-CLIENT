import FunnelLayout from './components/layout/FunnelLayout';
import ActivityInfo from './components/steps/activityInfo/ActivityInfo';
import FloorPlan from './components/steps/floorPlan/FloorPlan';
import HouseInfo from './components/steps/houseInfo/HouseInfo';
import InteriorStyle from './components/steps/interiorStyle/InteriorStyle';
import { useImageSetup } from './hooks/useImageGeneration';
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
