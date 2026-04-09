import { style } from '@vanilla-extract/css';

import { zIndex } from '@/shared/styles/tokens/zIndex';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '9.6rem',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['700'],
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
});

export const styleCardInfo = style({});

export const productList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const sectionTitle = style({
  ...fontVars.font.title_sb_16,
  marginBottom: unitVars.unit.gapPadding['400'],
});

export const products = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const ctaBtn = style({
  position: 'fixed',
  zIndex: zIndex.button,
  right: 0,
  bottom: unitVars.unit.gapPadding['500'],
  left: 0,
  margin: '0 auto',
  width: `calc(100% - ${unitVars.unit.gapPadding['500']} * 2)`,
  maxWidth: `calc(${unitVars.unit.dimension.wMax} - ${unitVars.unit.gapPadding['500']} * 2)`,
});
