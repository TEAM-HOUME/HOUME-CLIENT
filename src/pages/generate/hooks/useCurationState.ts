import { useMemo } from 'react';

import {
  useCurationStore,
  selectActiveImageState,
  type CurationSnapState,
} from '@pages/generate/stores/useCurationStore';

export const useActiveImageId = () =>
  useCurationStore((state) => state.activeImageId);

export const useActiveImageCurationState = () =>
  useCurationStore(selectActiveImageState);

export const useSheetSnapState = () => {
  const snapState = useCurationStore((state) => state.sheetSnapState);
  const setSnapState = useCurationStore((state) => state.setSheetSnapState);
  return useMemo(
    () => ({
      snapState,
      setSnapState,
    }),
    [snapState, setSnapState]
  );
};

export const useOpenCurationSection = () => {
  const { setSnapState } = useSheetSnapState();
  return (next: CurationSnapState) => {
    setSnapState(next);
  };
};
