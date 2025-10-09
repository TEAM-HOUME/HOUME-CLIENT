import { Activity } from 'react';

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
              history.push('FloorPlan', data);
            },
          },
          render({ dispatch, context, step }) {
            return (
              <Activity mode={step === 'HouseInfo' ? 'visible' : 'hidden'}>
                <HouseInfo
                  context={context}
                  onNext={(data) => dispatch('selectHouseInfo', data)}
                />
              </Activity>
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
          render({ dispatch, context, step }) {
            return (
              <Activity mode={step === 'FloorPlan' ? 'visible' : 'hidden'}>
                <FloorPlan
                  context={context}
                  onNext={(data) => dispatch('selectedFloorPlan', data)}
                />
              </Activity>
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
          render({ dispatch, context, step }) {
            return (
              <Activity mode={step === 'InteriorStyle' ? 'visible' : 'hidden'}>
                <InteriorStyle
                  context={context}
                  onNext={(data) => dispatch('selectInteriorStyle', data)}
                />
              </Activity>
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
          render({ dispatch, context, step }) {
            return (
              <Activity mode={step === 'ActivityInfo' ? 'visible' : 'hidden'}>
                <ActivityInfo
                  context={context}
                  onContextChange={(data) =>
                    dispatch('selectActivityInfo', data)
                  }
                />
              </Activity>
            );
          },
        })}
      />
    </FunnelLayout>
  );
};
