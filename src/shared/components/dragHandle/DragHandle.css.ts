import { style } from '@vanilla-extract/css';

export const wrapper = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '24px',
  cursor: 'grab',
  userSelect: 'none', // 드래그 중 텍스트가 선택되는 현상(하이라이트)을 방지
  selectors: {
    // 드래그 중일 때 커서 변경
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const dragHandle = style({
  width: '32px',
  height: '4px',
  backgroundColor: '#E5E7EB',
  borderRadius: '2px',
});
