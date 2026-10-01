// ------------------------------
// isValidProductUrl 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types src/pages/home/utils/isValidProductUrl.check.ts

import { isValidProductUrl } from './isValidProductUrl.ts';

// 설명, 입력, 통과 여부
const cases: [string, string, boolean][] = [
  ['빈 값', '', false],
  ['공백만', '   ', false],
  ['의미 없는 문자열', 'aklsadfjewiofdk', false],
  ['점으로 끝남', 'asdf.', false],
  ['TLD 1글자', 'a.b', false],
  ['중간 공백', 'https://coupang.com/a b', false],
  ['문구 + 링크', '쿠팡 https://coupang.com/x', false],
  ['빈 라벨', 'https://.com', false],
  ['호스트 끝의 점', 'https://coupang.com./x', false],
  ['javascript 스킴', 'javascript:alert(1)', false],
  ['스킴 없는 mailto', 'mailto:a@b.com', false],
  ['사용자 정보 포함', 'user@evil.com', false],
  ['localhost', 'https://localhost:3000', false],
  ['IPv4', 'http://192.168.0.1/x', false],
  ['IPv6', '[::1]', false],
  ['스킴만 입력', 'https://', false],
  ['정상 URL', 'https://www.coupang.com/vp/products/123?itemId=1', true],
  ['앞뒤 공백은 무시한다', '  https://www.coupang.com/vp/products/123  ', true],
  [
    '스킴이 없어도 통과한다 (서버가 프로토콜 생략을 처리)',
    'coupang.com/vp/products/123',
    true,
  ],
  ['포트를 스킴으로 오인하지 않는다', 'coupang.com:8080/x', true],
  ['대소문자 섞인 스킴·호스트', 'HTTPS://Coupang.com/A', true],
  ['http도 통과한다', 'http://coupang.com', true],
  ['프로토콜 종류는 판단하지 않는다 (서버 몫)', 'ftp://coupang.com/x', true],
  ['단축 링크', 'https://link.coupang.com/a/abc', true],
  ['한글 도메인', 'https://쿠팡.com/a', true],
  ['한글 TLD', 'https://a.한국', true],
  ['쿼리에 한글', 'https://coupang.com/vp?q=한글', true],
  [
    '형식만 맞으면 통과한다 (실재 여부는 서버가 판정)',
    'aklsadfjewiofdk.com',
    true,
  ],
];

let failed = 0;
for (const [label, input, expected] of cases) {
  const actual = isValidProductUrl(input);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}\n      입력: ${JSON.stringify(input)}\n      기대: ${expected}\n      실제: ${actual}`
  );
}

console.log(`\n총 ${cases.length}건 중 실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
