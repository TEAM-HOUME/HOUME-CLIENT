// ------------------------------
// 비교 로딩 롤링 인덱스 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types compareLoadingMessages.check.ts

import { getNextCompareLoadingCycle } from './compareLoadingMessages.ts';

const cases: [string, number, number][] = [
  ['첫 롤링 후 다음 인터랙션 사이클로 이동한다', 0, 1],
  ['문구 수와 무관하게 사이클은 계속 증가한다', 2, 3],
];

let failed = 0;

for (const [label, current, expected] of cases) {
  const actual = getNextCompareLoadingCycle(current);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}\n      기대: ${expected}\n      실제: ${actual}`
  );
}

console.log(`\n총 ${cases.length}건 중 실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
