// ------------------------------
// getSearchDayCount 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types \
//   src/pages/home/components/compare/utils/getSearchDayCount.check.ts
// 서버 createdAt은 시간대 표기 없는 UTC(예: 2026-09-17T06:23:20.014789)로 온다.
// 기대값은 한국(UTC+9) 기준이라 실행 환경의 시간대와 무관하게 아래에서 고정한다.

import process from 'node:process';

import { getSearchDayCount } from './getSearchDayCount.ts';

process.env.TZ = 'Asia/Seoul';

// 기준 시각: 2026-09-18 08:00 KST (= 2026-09-17T23:00Z)
const NOW = new Date('2026-09-18T08:00:00+09:00');

const cases: [string, string, number][] = [
  // 설명, createdAt, 기대 일수
  ['같은 날 오후 (UTC 06:23 = KST 15:23)', '2026-09-17T06:23:20.014789', 1],
  [
    '어제 밤 UTC 표기지만 KST로는 오늘 새벽 (UTC 17일 22:00 = KST 18일 07:00) → 0일',
    '2026-09-17T22:00:00.000000',
    0,
  ],
  ['Z가 붙은 값도 같은 결과', '2026-09-17T22:00:00Z', 0],
  ['+09:00 표기는 그대로 해석', '2026-09-18T07:00:00+09:00', 0],
  ['3일 전', '2026-09-15T00:00:00', 3],
  ['미래 값은 0으로 막는다', '2026-09-20T00:00:00', 0],
  ['파싱 안 되는 값은 0', 'not-a-date', 0],
];

let failed = 0;
for (const [label, input, expected] of cases) {
  const actual = getSearchDayCount(input, NOW);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    [
      `${ok ? 'PASS' : 'FAIL'}  ${label}`,
      `      입력: ${input}`,
      `      기대: ${expected}`,
      `      실제: ${actual}`,
    ].join('\n')
  );
}

console.log(`\n총 ${cases.length}건 중 실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
