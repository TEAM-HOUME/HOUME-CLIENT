import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const card = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  border: '2px solid transparent',
  borderRadius: unitVars.unit.radius['600'],
  boxShadow: '0 0 8px 0 #EAD3FF',
  backgroundClip: 'padding-box, border-box',
  backgroundImage: `linear-gradient(${colorVars.color.fill.inverse}, ${colorVars.color.fill.inverse}), var(--grad-widgetCardStroke, linear-gradient(248deg, #EAD3FF 13.54%, #CDDCFF 48.35%, #CDFFF0 83.17%))`,
  backgroundOrigin: 'border-box',
  padding: `${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['400']}`,
  width: '100%',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['050'],
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
});

export const title = style({
  margin: 0,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_14,
});

export const subtitle = style({
  margin: 0,
  color: colorVars.color.text.tertiary,
  ...fontVars.font.caption_r_12,
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
});

export const fakeLinkInput = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.whitish,
  cursor: 'pointer',
  padding: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const textLabel = style({
  background:
    'var(--grad-widgetLinkText, linear-gradient(225deg, #A357FF 0%, #4792FF 100%))',
  backgroundClip: 'text',
  padding: `0 ${unitVars.unit.gapPadding['200']}`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  ...fontVars.font.title_sb_14,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

export const itemRow = style({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
  minWidth: 0,
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});
