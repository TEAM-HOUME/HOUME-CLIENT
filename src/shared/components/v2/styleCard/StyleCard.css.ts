import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';

export const wrapper = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'auto',
  },
  variants: {
    scaleOnPress: {
      true: {
        transition: 'transform 100ms ease',
        selectors: {
          '&:has(button:active)': {
            transform: 'scale(0.98)',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    scaleOnPress: true,
  },
});

export const card = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'flex-start',
    border: 0,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  variants: {
    size: {
      s: {
        aspectRatio: '164 / 111',
        borderRadius: unitVars.unit.radius['500'],
        padding: unitVars.unit.gapPadding['300'],
        width: '100%',
        minWidth: '16.4rem',
      },
      L: {
        aspectRatio: '335 / 223',
        borderRadius: unitVars.unit.radius['600'],
        padding: unitVars.unit.gapPadding['500'],
        width: '100%',
        minWidth: '33.5rem',
      },
    },
  },
  defaultVariants: {
    size: 's',
  },
});

export const gradient = recipe({
  base: {
    position: 'absolute',
    zIndex: 0,
    inset: 0,
  },
  variants: {
    size: {
      s: {
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 39.71%, rgba(0, 0, 0, 0) 100%)',
      },
      L: {
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 56%, rgba(0, 0, 0, 0) 100%)',
      },
    },
  },
  defaultVariants: {
    size: 's',
  },
});

export const image = style({
  position: 'absolute',
  zIndex: 0,
  inset: 0,
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

/** L 전용: 아이콘 + 카드 제목(한 줄) */
export const largeHeader = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  gap: unitVars.unit.gapPadding['100'],
});

export const largeInlineTitle = style({
  whiteSpace: 'nowrap',
  color: colorVars.color.text.inverse,
  ...fontVars.font.title_m_15,
});

export const starIcon = recipe({
  base: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
  },
  variants: {
    size: {
      s: {
        width: '1.6rem',
        height: '1.6rem',
      },
      L: {
        width: '2rem',
        height: '2rem',
      },
    },
  },
  defaultVariants: {
    size: 's',
  },
});

export const title = recipe({
  base: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colorVars.color.text.secondary,
  },
  variants: {
    size: {
      s: {
        ...fontVars.font.body_r_14,
        marginTop: unitVars.unit.gapPadding['050'],
        padding: unitVars.unit.gapPadding['100'],
        width: '16.4rem',
      },
    },
  },
  defaultVariants: {
    size: 's',
  },
});

/** size=L & largeContnets 사용 시 */
export const largeFooter = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['050'],
  marginTop: unitVars.unit.gapPadding['400'],
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
  minWidth: '33.5rem',
});

export const largeFooterHeading = style({
  width: '100%',
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_16,
});

export const largeFooterDescription = style({
  height: ' 6rem',
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  ...fontVars.font.body_r_13,
  color: colorVars.color.text.secondary,
});
