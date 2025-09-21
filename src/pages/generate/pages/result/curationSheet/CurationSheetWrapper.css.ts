import { style } from '@vanilla-extract/css';

import { layoutVars } from '@/shared/styles/global.css';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const sheetWrapper = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: layoutVars.maxWidth,

  backgroundColor: colorVars.color.gray000,
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  boxShadow: '0 -10px 14px 0 rgba(209, 213, 219, 0.10)',

  zIndex: zIndex.sheet,
  transition: 'max-height 300ms ease-out', // 높이 변경에 애니메이션 적용
  display: 'flex',
  flexDirection: 'column',
});
