import { style } from '@vanilla-extract/css';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';

export const pageLayout = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minHeight: '100%',
});

export const content = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%',
  minHeight: 0,
});

export const resultBody = style({
  flex: 1,
  width: '100%',
  minWidth: 0,
});

export const devViewToggle = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.8rem',
  marginTop: 'auto',
  padding: '1.2rem 2rem 2.4rem',
});

export const devViewToggleLabel = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});

export const devViewToggleButtons = style({
  display: 'flex',
  gap: '0.6rem',
});

export const devViewToggleBtn = style({
  border: `1px solid ${colorVars.color.gray200}`,
  borderRadius: '0.8rem',
  backgroundColor: colorVars.color.gray000,
  cursor: 'pointer',
  padding: '0.6rem 1rem',
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray700,
});

export const devViewToggleBtnActive = style({
  borderColor: colorVars.color.gray900,
  color: colorVars.color.gray900,
});

export const skeletonImage = style({
  aspectRatio: '1 / 1',
  margin: '0 auto',
  borderRadius: '16px',
  backgroundColor: colorVars.color.gray100,
  width: '100%',
  maxWidth: '33.5rem',
});

export const skeletonBlock = style({
  borderRadius: '8px',
  backgroundColor: colorVars.color.gray100,
});

export const skeletonLine = style([
  skeletonBlock,
  {
    width: '100%',
    height: '1.2rem',
  },
]);

export const skeletonLineShort = style([
  skeletonBlock,
  {
    width: '60%',
    height: '1.2rem',
  },
]);

export const textGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  margin: '0 auto',
  width: '100%',
  maxWidth: '33.5rem',
});

export const placeholderNote = style({
  ...fontStyle('caption_r_12'),
  marginTop: 'auto',
  textAlign: 'center',
  color: colorVars.color.gray500,
});
