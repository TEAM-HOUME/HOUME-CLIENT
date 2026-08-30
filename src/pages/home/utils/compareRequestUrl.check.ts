// ------------------------------
// toCompareRequestUrl 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types src/pages/home/utils/compareRequestUrl.check.ts

import { toCompareRequestUrl } from './compareRequestUrl.ts';

const cases: [string, string, string][] = [
  // 설명, 입력, 기대값
  [
    '한글 경로는 인코딩한다',
    'https://a.com/한글/1',
    'https://a.com/%ED%95%9C%EA%B8%80/1',
  ],
  [
    '이미 인코딩된 값은 그대로 둔다',
    'https://a.com/%ED%95%9C%EA%B8%80/1',
    'https://a.com/%ED%95%9C%EA%B8%80/1',
  ],
  ['인코딩된 슬래시를 보존한다', 'https://a.com/x%2Fy', 'https://a.com/x%2Fy'],
  [
    '쿼리의 한글도 인코딩한다',
    'https://a.com/p?q=한글',
    'https://a.com/p?q=%ED%95%9C%EA%B8%80',
  ],
  [
    '광고 추적 파라미터는 서버가 처리하므로 그대로 보낸다',
    'https://store.ohou.se/goods/3603649?utm_source=a&gclid=b',
    'https://store.ohou.se/goods/3603649?utm_source=a&gclid=b',
  ],
  [
    '해시를 보존한다',
    'https://a.com/p#리뷰',
    'https://a.com/p#%EB%A6%AC%EB%B7%B0',
  ],
  [
    '파싱 안 되는 값은 원문 그대로 넘겨 서버가 판정하게 한다',
    'not a url',
    'not a url',
  ],
];

let failed = 0;
for (const [label, input, expected] of cases) {
  const actual = toCompareRequestUrl(input);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}\n      입력: ${input}\n      기대: ${expected}\n      실제: ${actual}`
  );
}

// 두 번 적용해도 값이 변하지 않아야 한다 (딥링크 → 재검색처럼 같은 값이 두 번 지날 수 있다)
for (const [, input] of cases) {
  const once = toCompareRequestUrl(input);
  const twice = toCompareRequestUrl(once);
  if (once !== twice) {
    failed += 1;
    console.log(
      `FAIL  두 번 적용하면 값이 바뀐다\n      1회: ${once}\n      2회: ${twice}`
    );
  }
}

console.log(
  `\n총 ${cases.length}건 + 멱등성 ${cases.length}건 중 실패 ${failed}건`
);
process.exit(failed === 0 ? 0 : 1);
