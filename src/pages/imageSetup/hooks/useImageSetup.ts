import { useFunnel } from '@use-funnel/react-router';

import { FUNNEL_ID } from '@constants/funnel';

import type { ImageSetupSteps } from '../types/funnel/steps';

export const useImageSetup = () => {
  return useFunnel<ImageSetupSteps>({
    id: FUNNEL_ID,
    initial: {
      step: 'FloorPlanSelect',
      context: {},
    },
  });
};
