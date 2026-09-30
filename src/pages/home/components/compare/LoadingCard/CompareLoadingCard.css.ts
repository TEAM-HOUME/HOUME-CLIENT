import { keyframes, style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { interactionVars } from '@styles/tokens/interaction/tokens.css';
import { unitVars } from '@styles/tokens/unit.css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const dotEnter = keyframes({
  from: { transform: 'translateY(-10px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colorVars.color.fill.whitish,
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
  minWidth: 0,
  height: '4.8rem',
});

export const rollingContent = style({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
});

export const message = style({
  ...fontVars.font.body_r_14,
  overflow: 'hidden',
  animation: `${fadeIn} ${interactionVars.interaction.duration.slowest} ${interactionVars.interaction.easing['bezier.inout']} both`,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
});

export const dots = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  width: '3.2rem',
  height: '3.2rem',
});

export const dot = style({
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.primary,
  width: '4px',
  height: '4px',
  animation: `${dotEnter} ${interactionVars.interaction.duration.slower} ${interactionVars.interaction.easing['bezier.back']} both`,
  selectors: {
    '&:nth-child(2)': {
      backgroundColor: colorVars.color.fill.tertiary,
      animationDelay: interactionVars.interaction.duration.fastest,
    },
    '&:nth-child(3)': {
      backgroundColor: colorVars.color.fill.disabled,
      animationDelay: interactionVars.interaction.duration.fast,
    },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
});
