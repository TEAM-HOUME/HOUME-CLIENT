import { useEffect, useState } from 'react';

import FunnelLayout from './components/layout/FunnelLayout';
import { useImageSetup } from './hooks/useImageGeneration';
import ActivityInfo from './pages/activityInfo/ActivityInfo';
import FloorPlan from './pages/floorPlan/FloorPlan';
import HouseInfo from './pages/houseInfo/HouseInfo';
import InteriorStyle from './pages/interiorStyle/InteriorStyle';
import { useFunnelStore } from './stores/useFunnelStore';
import {
  type CompletedFloorPlan,
  type CompletedInteriorStyle,
} from './types/funnel/steps';

import type { CompletedHouseInfo } from './types/funnel/houseInfo';

type StepType = 'HouseInfo' | 'FloorPlan' | 'InteriorStyle' | 'ActivityInfo';

interface StepWrapperProps {
  step: StepType;
  onMount: (step: StepType) => void;
  children: React.ReactNode;
}

const StepWrapper = ({ step, onMount, children }: StepWrapperProps) => {
  useEffect(() => {
    onMount(step);
  }, [step, onMount]);

  return <>{children}</>;
};

export const ImageSetup = () => {
  const funnel = useImageSetup();
  const [currentStep, setCurrentStep] = useState<StepType>('HouseInfo');

  // 퍼널 전체가 unmount될 때 (퍼널 벗어날 때) 데이터 초기화
  useEffect(() => {
    return () => {
      useFunnelStore.getState().reset();
    };
  }, []);

  return (
    <FunnelLayout currentStep={currentStep}>
      <funnel.Render
        HouseInfo={funnel.Render.with({
          events: {
            selectHouseInfo: (data: CompletedHouseInfo, { history }) => {
              history.push('FloorPlan', data);
            },
          },
          render({ dispatch, context }) {
            return (
              <StepWrapper step="HouseInfo" onMount={setCurrentStep}>
                <HouseInfo
                  context={context}
                  onNext={(data) => dispatch('selectHouseInfo', data)}
                />
              </StepWrapper>
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
              <StepWrapper step="FloorPlan" onMount={setCurrentStep}>
                <FloorPlan
                  context={context}
                  onNext={(data) => dispatch('selectedFloorPlan', data)}
                />
              </StepWrapper>
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
              <StepWrapper step="InteriorStyle" onMount={setCurrentStep}>
                <InteriorStyle
                  context={context}
                  onNext={(data) => dispatch('selectInteriorStyle', data)}
                />
              </StepWrapper>
            );
          },
        })}
        ActivityInfo={funnel.Render.with({
          events: {},
          render({ context }) {
            return (
              <StepWrapper step="ActivityInfo" onMount={setCurrentStep}>
                <ActivityInfo context={context} />
              </StepWrapper>
            );
          },
        })}
      />
    </FunnelLayout>
  );
};
