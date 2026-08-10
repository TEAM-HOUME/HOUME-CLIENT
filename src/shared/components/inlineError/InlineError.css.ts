import { style } from '@vanilla-extract/css';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.8rem',
  paddingBottom: '4.5rem',
  width: '100%',
  textAlign: 'center',
});

export const message = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray600,
});

export const retryButton = style({
  marginTop: '0.4rem',
  border: '1px solid',
  borderRadius: '999px',
  borderColor: colorVars.color.gray300,
  backgroundColor: colorVars.color.gray000,
  cursor: 'pointer',
  ...fontStyle('caption_m_12'),
  padding: '0.8rem 1.6rem',
  color: colorVars.color.gray600,
});
