import { useFunnel } from '@use-funnel/react-router';

import type { ImageSetupSteps } from '../types/funnel/steps';

export const useImageSetup = () => {
  return useFunnel<ImageSetupSteps>({
    id: 'image-generation-funnel',
    initial: {
      step: 'FloorPlanSelect',
      context: {},
    },
  });
};
