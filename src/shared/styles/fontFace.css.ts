import { globalFontFace } from '@vanilla-extract/css';

globalFontFace('Pretendard', {
  src: `
    local("Pretendard Regular"),
    url(${import.meta.env.BASE_URL}fonts/Pretendard-Regular.woff2) format("woff2")
  `,
  fontWeight: '400',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace('Pretendard', {
  src: `
    local("Pretendard Medium"),
    url(${import.meta.env.BASE_URL}fonts/Pretendard-Medium.woff2) format("woff2")
  `,
  fontWeight: '500',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace('Pretendard', {
  src: `
    local("Pretendard SemiBold"),
    url(${import.meta.env.BASE_URL}fonts/Pretendard-SemiBold.woff2) format("woff2")
  `,
  fontWeight: '600',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});
