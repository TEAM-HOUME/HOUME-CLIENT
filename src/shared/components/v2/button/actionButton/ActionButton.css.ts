import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';

const sizeVariantStyles = {
  XS: {
    ...fontVars.font.caption_r_11,
    padding: `${unitVars.unit.gapPadding['000']} calc(${unitVars.unit.gapPadding['100']} + ${unitVars.unit.gapPadding['050']})`,
    minWidth: '4rem',
    height: '2.6rem',
    ':active': { transform: 'scale(0.95)' },
  },
  S: {
    ...fontVars.font.body_m_13,
    padding: `${unitVars.unit.gapPadding['100']} calc(${unitVars.unit.gapPadding['200']} + ${unitVars.unit.gapPadding['050']})`,
    minWidth: '4rem',
    height: '3.2rem',
    ':active': { transform: 'scale(0.95)' },
  },
  M: {
    ...fontVars.font.body_m_14,
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['300']}`,
    minWidth: '6rem',
    height: '4rem',
    ':active': { transform: 'scale(0.95)' },
  },
  L: {
    ...fontVars.font.title_m_15,
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['400']}`,
    minWidth: '6.4rem',
    height: '4.4rem',
    ':active': { transform: 'scale(0.95)' },
  },
  XL: {
    ...fontVars.font.title_m_16,
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['400']}`,
    minWidth: '6.4rem',
    height: '4.8rem',
    ':active': { transform: 'scale(0.98)' },
  },
  '2XL': {
    ...fontVars.font.title_m_16,
    padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
    minWidth: '8rem',
    height: '5.6rem',
    ':active': { transform: 'scale(0.98)' },
  },
} as const;

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'center center',
    transition:
      'background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease',
    border: 'none',
    borderRadius: unitVars.unit.radius['full'],
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  variants: {
    variant: {
      solid: {},
      outlined: {
        border: `1px solid ${colorVars.color.border.primary}`,
      },
      ghost: {},
    },
    color: {
      primary: {
        background: colorVars.color.fill.primary,
        color: colorVars.color.text.inverse,
      },
      inverse: {
        background: colorVars.color.fill.inverse,
        color: colorVars.color.text.primary,
      },
    },
    size: {
      ...sizeVariantStyles,
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        ':active': { transform: 'none' },
      },
      false: {},
    },
    fullWidth: {
      true: { width: '100%' },
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { disabled: true, color: 'primary' },
      style: {
        background: colorVars.color.fill.disabled,
        color: colorVars.color.text.inverse,
      },
    },
    {
      variants: { disabled: true, color: 'inverse' },
      style: {
        background: colorVars.color.fill.inverseSecondary,
        color: colorVars.color.text.tertiary,
      },
    },
    {
      variants: { variant: 'ghost' },
      style: {
        background: `rgba(255, 255, 255, 0.10)`,
        color: colorVars.color.text.inverse,
      },
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: '2XL',
    disabled: false,
    fullWidth: false,
  },
});

export const btnLabel = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  },
  variants: {
    size: {
      XS: {
        padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['050']}`,
      },
      S: {},
      M: {},
      L: {},
      XL: {},
      '2XL': {},
    },
  },
});
