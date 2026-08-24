type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityFn & { q?: unknown[][] };
  }
}

const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

export function initClarity() {
  if (!CLARITY_PROJECT_ID) return;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // HMR guard
  if (document.querySelector('script[data-houme-clarity="true"]')) {
    return;
  }

  window.clarity =
    window.clarity ||
    function (...args: unknown[]) {
      (window.clarity!.q = window.clarity!.q || []).push(args);
    };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  script.dataset['houmeClarity'] = 'true';

  document.head.appendChild(script);
}

/**
 * Clarity 고급 API 래퍼
 *
 * - `window.clarity`는 `initClarity()`가 render 전에 큐 shim으로 동기 할당
 *   env(`VITE_CLARITY_PROJECT_ID`) 미설정 시엔 할당되지 않으므로 `?.` 로 안전하게 no-op 처리됨
 * - 스크립트 로드 전 호출은 shim의 큐(`window.clarity.q`)에 버퍼링됐다가 로드 후 재생됨
 */

/** 커스텀 태그: Clarity 세션에 key-value를 붙여 Filters/Segments에서 필터링 (value는 문자열 또는 문자열 배열) */
export function setClarityTag(key: string, value: string | string[]): void {
  window.clarity?.('set', key, value);
}

/** 커스텀 이벤트: 핵심 전환을 마킹 → Smart Events/Funnels에 노출 */
export function clarityEvent(name: string): void {
  window.clarity?.('event', name);
}

/** 세션 우선 레코딩: 에러/전환 등 중요한 세션을 일일 샘플링에서 보호 */
export function upgradeClaritySession(reason: string): void {
  window.clarity?.('upgrade', reason);
}
