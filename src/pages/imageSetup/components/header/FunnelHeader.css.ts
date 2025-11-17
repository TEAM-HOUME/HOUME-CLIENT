import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { animationTokens } from '@/shared/styles/tokens/animation.css';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const wrapper = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: '2rem',
    animation: animationTokens.fadeInUpFast,
  },
  variants: {
    size: {
      short: {
        minHeight: '13.5rem',
      },
      long: {
        minHeight: '15.6rem',
      },
    },
  },
});

export const container = style({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  position: 'relative',
});

export const headerWapper = style({
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '1.2rem',
  position: 'relative',
  zIndex: zIndex.text,
  flex: '1 1 auto', // 텍스트 영역이 필요한 만큼만 차지
  minWidth: 0, // 텍스트가 넘치지 않도록
});

export const imgWrapper = style({
  width: '14.4rem',
  display: 'flex',
  flexShrink: 0,
  flexGrow: 0,
  position: 'relative',
  zIndex: zIndex.base,
});

export const progressWrapper = style({
  position: 'relative',
  marginBottom: '2.4rem',
  zIndex: zIndex.text,
});

export const textWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  paddingRight: '1rem',
  position: 'relative',
  zIndex: zIndex.text,
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
  whiteSpace: 'nowrap',
});

export const detail = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
  whiteSpace: 'pre', // 문자열에 개행(\n)이 있을 때만 줄바꿈함
});

export const image = style({
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  maxWidth: '14.4rem',
});
