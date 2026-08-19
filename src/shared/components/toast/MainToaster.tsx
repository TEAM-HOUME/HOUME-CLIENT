import { useEffect, type CSSProperties } from 'react';

import { Toaster } from 'sonner';

import {
  TOASTER_CONFIGS,
  TOASTER_DEFAULTS,
  TOASTER_ID,
  TOAST_TYPE,
} from '@shared/types/toast';

import { TOAST_MESSAGE } from '@constants/toastMessage';

import './MainToaster.css';

import { unitVars } from '@styles/tokens/unit.css';

import { useToast } from './useToast';

const TOASTER_SIDE_MARGIN = '2rem';

const toasterStyle = {
  width: `calc(100dvw - ${TOASTER_SIDE_MARGIN} * 2)`,
  maxWidth: `calc(${unitVars.unit.dimension.wMax} - ${TOASTER_SIDE_MARGIN} * 2)`,
  left: '50%',
  right: 'auto',
  transform: 'translateX(-50%)',
} satisfies CSSProperties;

const MainToaster = () => {
  const { notify } = useToast();

  useEffect(() => {
    const notifyNetworkError = () => {
      notify({
        text: TOAST_MESSAGE.NETWORK_UNSTABLE,
        type: TOAST_TYPE.ERROR,
        hasIcon: false,
        options: { toasterId: TOASTER_ID.BOTTOM_4 },
      });
    };

    window.addEventListener('offline', notifyNetworkError);

    return () => {
      window.removeEventListener('offline', notifyNetworkError);
    };
  }, [notify]);

  return (
    <>
      {TOASTER_CONFIGS.map(({ id, position, offset }) => (
        <Toaster
          key={id}
          id={id}
          position={position}
          offset={offset}
          mobileOffset={{ ...offset, left: '0rem', right: '0rem' }}
          style={toasterStyle}
          toastOptions={{ unstyled: true }}
          {...TOASTER_DEFAULTS}
        />
      ))}
    </>
  );
};

export default MainToaster;
