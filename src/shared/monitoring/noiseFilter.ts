import type { ErrorEvent } from '@sentry/react';

/**
 * 앱과 무관한 노이즈 판별
 *
 * 인스타그램 광고 유입 사용자가 대부분 -> 프로덕션 에러의 상당수가
 * 인앱브라우저(iOS WKWebView / 안드로이드 웹뷰)가 페이지에 끼워 넣은 스크립트에서 발생한다.
 * 이 노이즈가 진짜 에러를 덮지 않도록 유입 단계에서 걸러낸다.
 */

/** Sentry `ignoreErrors`에 그대로 전달되는 노이즈 메시지 패턴
 * '에러 메시지'로 로깅 차단 결정
 */
export const NOISE_ERROR_PATTERNS: RegExp[] = [
  // 인스타 인앱브라우저(iOS)가 끼워 넣은 스크립트의 네이티브 브릿지 접근 — 기능 영향 없음
  /window\.webkit\.messageHandlers/,
  // 인스타 안드로이드 웹뷰가 페이지를 떠날 때 브릿지 객체가 먼저 해제되며 발생
  /Java object is gone/,
  // 페이지 이동으로 요청이 취소된 정상 상황
  /^AbortError/,
  /The operation was aborted/,
  // Firebase installations가 인앱 웹뷰 종료 중 IndexedDB를 닫으며 발생
  /database connection is closing/i,
  /Database deleted by request of the user/,
  // 브라우저 레이아웃 계산 경고 — 렌더 결과에는 영향 없음
  /ResizeObserver loop/,
];

/**
 * '스크립트 주소(ex: iabjs://)'로 로깅 차단 결정
 *
 * `iabjs://`는 인스타그램 안드로이드 인앱브라우저가 자체 스크립트를 실행할 때 쓰는 주소
 * (iab = in-app browser). 하우미 코드에서는 나올 수 없으므로 메시지와 무관하게 차단한다.
 * 메시지 패턴(`Java object is gone`)만으로 막으면 인스타가 스크립트를 바꿔 다른 메시지가 나올 때 막지 못함.
 */
export const NOISE_DENY_URLS: RegExp[] = [
  /^iabjs:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-(web-)?extension:\/\//i,
  /extensions\//i,
];

/** 스크립트 파일 경로로 끝나는지 (쿼리스트링·해시는 빼고 판단) */
const SCRIPT_FILE_PATTERN = /\.(js|mjs|cjs)(\?|#|$)/i;

/**
 * 프레임이 실제 스크립트 파일이 아닌 곳에서 왔는지 판별한다.
 * 파일명을 모르면 판단하지 않는다(모르는 것을 노이즈로 몰지 않기 위해).
 */
const isNonScriptFrame = (filename?: string): boolean => {
  if (!filename) return false;

  return !SCRIPT_FILE_PATTERN.test(filename);
};

/**
 * Sentry 대시보드의 스택 트레이스 전체가 스크립트 파일이 아닌 곳에서 나온 에러인지 판별
 * -> 하나도 .js 파일이 아닐 시 noise_candidate
 *
 * 왜 필요한가 — 메시지·주소(형식)로 막는 위 두 방법은 그 값을 미리 알아야 동작한다. 반면 인스타가 스크립트를 바꾸면 새 메시지가 나와 둘 다 놓친다(실제로 -F → -K → -P로 유사한 오류에 대한 변형이 계속 생김).
 * 이 함수는 '파일로 불러오지 않은 코드'라는 '구조'만 보므로 정확한 메시지·주소(형식)를 몰라도 판별한다.
 *
 * 분석 시 주의 — 대시보드에서 In App으로 보여도 실제로는 하우미 내부 코드가
 * 아닐 수 있다. 이 함수는 방어 장치일 뿐이므로 이슈를 분석할 때는 파일 경로를 눈으로
 * 한 번 더 확인해야 한다.
 *
 * 오탐 가능성 — `index.html`에 직접 넣은 Meta Pixel 스크립트가 에러를 던지면 여기 걸린다. 다만 차단하지 않고 `noise_candidate` 태그만 붙이므로 이벤트는 그대로 수집된다.
 */
export const isInjectedScriptEvent = (event: ErrorEvent): boolean => {
  const values = event.exception?.values;
  if (!values || values.length === 0) return false;

  const frames = values.flatMap((value) => value.stacktrace?.frames ?? []);
  // 스택 자체가 없으면 판단 근거가 없다
  if (frames.length === 0) return false;

  return frames.every((frame) => isNonScriptFrame(frame.filename));
};
