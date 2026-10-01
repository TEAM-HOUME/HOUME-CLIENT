// ------------------------------
// compareErrorPresentation 검증 케이스
// ------------------------------
// 실행: node --experimental-strip-types src/pages/home/utils/compareErrorPresentation.check.ts

import { resolveCompareErrorCase } from './compareErrorPresentation.ts';
import { COMPARE_ERROR_CASE } from '../constants/compareErrorCode.ts';

const cases: [number | null, string][] = [
  [40033, COMPARE_ERROR_CASE.INVALID_LINK],
  [40036, COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE],
  [40037, COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE],
  [40038, COMPARE_ERROR_CASE.SCRAPING_BLOCKED],
  [40400, COMPARE_ERROR_CASE.SCRAPING_BLOCKED],
  [50026, COMPARE_ERROR_CASE.COMPARE_FAILED],
  [50027, COMPARE_ERROR_CASE.COMPARE_FAILED],
  [50028, COMPARE_ERROR_CASE.COMPARE_FAILED],
  [42901, COMPARE_ERROR_CASE.BUSY],
  [40428, COMPARE_ERROR_CASE.TEMPORARY],
  [40039, COMPARE_ERROR_CASE.TEMPORARY],
  [40430, COMPARE_ERROR_CASE.TEMPORARY],
  [null, COMPARE_ERROR_CASE.TEMPORARY],
  [99999, COMPARE_ERROR_CASE.TEMPORARY],
];

let failed = 0;
for (const [errorCode, expected] of cases) {
  const actual = resolveCompareErrorCase(errorCode);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  errorCode=${String(errorCode)}\n      기대: ${expected}\n      실제: ${actual}`
  );
}

console.log(`\n총 ${cases.length}건 중 실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
