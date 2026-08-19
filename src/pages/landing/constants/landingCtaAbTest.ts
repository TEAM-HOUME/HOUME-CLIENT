import type { ABTestGroup } from '@shared/types/abTest';

import type {
  ActionButtonColor,
  ActionButtonVariant,
} from '@components/button/actionButton/ActionButton';
import type { IconName } from '@components/icon/Icon';

export interface LandingCtaStyle {
  buttonVariant: ActionButtonVariant;
  color: ActionButtonColor;
  leftIcon?: IconName;
}

/** 랜딩 CTA A/B: A = solid inverse, B = ghost + 아이콘 */
export const LANDING_CTA_BY_VARIANT: Record<ABTestGroup, LandingCtaStyle> = {
  A: {
    buttonVariant: 'solid',
    color: 'inverse',
  },
  B: {
    buttonVariant: 'ghost',
    color: 'primary',
    leftIcon: 'DoubleStar',
  },
};
