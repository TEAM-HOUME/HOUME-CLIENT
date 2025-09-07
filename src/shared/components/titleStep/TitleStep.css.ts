import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '1.2rem',
  alignItems: 'flex-start',
  padding: '0 2rem',
});

export const stepLabelBox = style({
  display: 'flex',
  width: '5.6rem',
  height: '2.8rem',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '4px',
  backgroundColor: colorVars.color.primary_light2,
});

export const stepLabel = style({
  ...fontStyle('caption_m_12'),
  color: colorVars.color.primary,
  whiteSpace: 'nowrap',
});

export const title = style({
  ...fontStyle('heading_sb_18'),
  color: colorVars.color.gray900,
  alignSelf: 'stretch',
});
