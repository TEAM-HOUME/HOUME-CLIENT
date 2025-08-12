import { useImageSetup } from './hooks/useImageGeneration';
import HouseInfo from './components/steps/houseInfo/HouseInfo';
import Step2FloorPlan from './components/steps/floorPlan/FloorPlan';
import InteriorStyle from './components/steps/interiorStyle/InteriorStyle';
import ActivityInfo from './components/steps/activityInfo/ActivityInfo';
import {
  type CompletedHouseInfo,
  type CompletedFloorPlan,
  type CompletedInteriorTaste,
} from './types/funnel';
import FunnelLayout from './components/layout/FunnelLayout';

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
              history.push('InteriorTaste', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <Step2FloorPlan
                context={context}
                onNext={(data) => dispatch('selectedFloorPlan', data)}
              />
            );
          },
        })}
        InteriorTaste={funnel.Render.with({
          events: {
            selectInteriorTaste: (
              data: CompletedInteriorTaste,
              { history }
            ) => {
              history.push('MainActivity', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <InteriorStyle
                context={context}
                onNext={(data) => dispatch('selectInteriorTaste', data)}
              />
            );
          },
        })}
        MainActivity={funnel.Render.with({
          events: {},
          render({ context }) {
            return <ActivityInfo context={context} />;
          },
        })}
      />
    </FunnelLayout>
  );
};
