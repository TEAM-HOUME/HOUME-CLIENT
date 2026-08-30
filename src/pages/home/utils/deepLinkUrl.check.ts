// ------------------------------
// restoreDeepLinkUrl 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types src/pages/home/utils/deepLinkUrl.check.ts
// (레포에 테스트 러너가 없어 node의 타입 제거 실행으로 돌린다. 러너를 도입하면 그 API로 옮긴다.)
// 아무 데서도 import하지 않으므로 vite 번들에는 안 들어간다. 다만 tsc -b의 타입 검사 대상에는 포함된다.

import { restoreDeepLinkUrl } from './deepLinkUrl.ts';

const cases: [string, string, string, string, string | null][] = [
  // 설명, pathname, search, hash, 기대값
  [
    '프로덕션 실측 도착 형태(// 정규화됨)',
    '/https:/29cm.co.kr/product/123',
    '?option=7',
    '',
    'https://29cm.co.kr/product/123?option=7',
  ],
  [
    '// 살아있는 형태(로컬 dev)',
    '/https://29cm.co.kr/product/123',
    '?option=7',
    '',
    'https://29cm.co.kr/product/123?option=7',
  ],
  [
    '프로토콜 생략',
    '/29cm.co.kr/product/12345',
    '',
    '',
    'https://29cm.co.kr/product/12345',
  ],
  ['http 유지', '/http:/example.com/a', '', '', 'http://example.com/a'],
  ['대문자 프로토콜', '/HTTPS:/example.com/a', '', '', 'https://example.com/a'],
  [
    '인코딩된 콜론',
    '/https%3A/29cm.co.kr/p/1',
    '',
    '',
    'https://29cm.co.kr/p/1',
  ],
  [
    '전체 인코딩 단일 세그먼트',
    '/https%3A%2F%2F29cm.co.kr%2Fproduct%2F123%3Foption%3D7',
    '',
    '',
    'https://29cm.co.kr/product/123?option=7',
  ],
  [
    '전체 인코딩 + 프로토콜 생략',
    '/29cm.co.kr%2Fproduct%2F123',
    '',
    '',
    'https://29cm.co.kr/product/123',
  ],
  ['해시 보존', '/https:/a.com/p', '', '#reviews', 'https://a.com/p#reviews'],
  [
    '원본 URL의 %2F는 디코딩하지 않는다',
    '/https:/a.com/x%2Fy',
    '',
    '',
    'https://a.com/x%2Fy',
  ],
  [
    '쿼리 여러 개 보존',
    '/https:/a.com/p',
    '?a=1&b=2',
    '',
    'https://a.com/p?a=1&b=2',
  ],
  [
    '한글 인코딩 경로 보존',
    '/29cm.co.kr/%ED%95%9C/1',
    '',
    '',
    'https://29cm.co.kr/%ED%95%9C/1',
  ],
  [
    'www 포함 호스트',
    '/https:/www.29cm.co.kr/catalog/12345.do',
    '?ref=a',
    '',
    'https://www.29cm.co.kr/catalog/12345.do?ref=a',
  ],
  [
    '포트 포함',
    '/https:/shop.co.kr:8443/p/1',
    '',
    '',
    'https://shop.co.kr:8443/p/1',
  ],
  [
    '깨진 퍼센트 시퀀스는 서버 판정에 맡긴다',
    '/https:/a.com/x%ZZ',
    '',
    '',
    'https://a.com/x%ZZ',
  ],
  // 딥링크가 아닌 경로 → null → NotFound
  ['앱 경로 오타', '/mypagee', '', '', null],
  ['앱 경로', '/login', '', '', null],
  ['루트', '/', '', '', null],
  ['호스트 없는 프로토콜만', '/https:/', '', '', null],
  ['상대경로 조각', '/product/123', '', '', null],
];

let failed = 0;
for (const [label, pathname, search, hash, expected] of cases) {
  const actual = restoreDeepLinkUrl({ pathname, search, hash });
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}\n      입력: ${pathname}${search}${hash}\n      기대: ${expected}\n      실제: ${actual}`
  );
}
console.log(`\n총 ${cases.length}건 중 실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
