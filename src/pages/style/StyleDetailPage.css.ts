import { style } from '@vanilla-extract/css';

import { zIndex } from '@styles/tokensV2/zIndex';

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
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
});

export const products = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const btnWrapper = style({
  position: 'fixed',
  zIndex: zIndex.button,
  bottom: 0,
  left: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateX(-50%)',
  backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)`,
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
});
