import { keyframes, style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import {
  TOOLTIP_AFTER_DELAY_MS,
  tooltipFadeInSpec,
} from '@styles/tokens/interaction/presets';
import {
  interactionDurationMs,
  interactionEasing,
} from '@styles/tokens/interaction/utils';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

const tooltipFadeInKeyframes = keyframes({
  from: {
    transform: 'scale(0.8)',
    opacity: 0,
  },
  to: {
    transform: 'scale(1)',
    opacity: 1,
  },
});

export const wrapper = style({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const tooltip = style({
  position: 'absolute',
  zIndex: zIndex.button,
  bottom: 'calc(100% + 1.56rem)',
  left: '50%',
  transform: 'translateX(-50%)',
});

export const tooltipContent = style({
  display: 'flex',
  alignItems: 'center',
  transformOrigin: 'center center',
  borderRadius: unitVars.unit.radius.full,
  background: colorVars.color.fill.secondary,
  padding: `${unitVars.unit.gapPadding['100']} ${unitVars.unit.gapPadding['200']}`,
  width: '100%',
  minWidth: 'max-content',
  maxWidth: '27.7rem',
  animation: `${tooltipFadeInKeyframes} ${interactionDurationMs(tooltipFadeInSpec)}ms ${interactionEasing(tooltipFadeInSpec)} ${TOOLTIP_AFTER_DELAY_MS}ms both`,
  whiteSpace: 'nowrap',
});

export const message = style({
  display: 'inline-flex',
  ...fontVars.font.caption_r_12,
  padding: unitVars.unit.gapPadding['100'],
  color: colorVars.color.text.inverse,
});

export const arrow = style({
  position: 'absolute',
  bottom: '-0.78rem',
  left: '50%',
  transform: 'translateX(-50%)',
  color: colorVars.color.fill.secondary,
});

export const arrowIcon = style({
  display: 'block',
  width: '100%',
  height: '100%',
});

export const trigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});
