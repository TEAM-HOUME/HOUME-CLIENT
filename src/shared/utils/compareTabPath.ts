import { ROUTES } from '@routes/paths';

import { HOME_TABS, type HomeTab } from '@shared/types/tabNavigation';

import {
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRESET_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
  HOME_TAB_PARAM,
} from '@constants/compareParams';

/** URL의 tab 값을 HomeTab으로 읽는다. 없거나 모르는 값이면 null */
export const parseHomeTab = (value: string | null): HomeTab | null =>
  HOME_TABS.find((tab) => tab === value) ?? null;

/**
 * 비교 탭이 무엇을 보여줄지. 세 값은 동시에 켜지지 않는다 — job·프리셋·입력 URL 중 하나거나(null) 빈 입력 화면.
 */
export type CompareTabTarget =
  | { jobId: string }
  | { presetId: number }
  | { productUrl: string }
  | null;

/**
 * 기존 쿼리에 비교 탭 파라미터를 적용한다: tab=compare를 켜고, jobId·presetId·productUrl을 전부 지운 뒤 target 하나만 켠다.
 *
 * 한 함수로 모은 이유: "셋 다 지우고 하나만 켠다"를 호출부마다 따로 쓰면 하나가 빠졌을 때 job과 프리셋이 동시에 켜져
 * 화면이 어느 쪽을 그릴지 애매해진다(CompareTab은 presetId를 우선하지만 URL이 거짓말을 하게 된다).
 * 원본 쿼리는 바꾸지 않고 새 URLSearchParams를 돌려준다 (setSearchParams의 updater에 그대로 넣는다).
 */
export const applyCompareTabParams = (
  prev: URLSearchParams,
  target: CompareTabTarget
): URLSearchParams => {
  const next = new URLSearchParams(prev);
  next.set(HOME_TAB_PARAM, 'compare');
  next.delete(COMPARE_JOB_ID_PARAM);
  next.delete(COMPARE_PRESET_ID_PARAM);
  next.delete(COMPARE_PRODUCT_URL_PARAM);

  if (target === null) return next;
  if ('jobId' in target) next.set(COMPARE_JOB_ID_PARAM, target.jobId);
  else if ('presetId' in target) {
    next.set(COMPARE_PRESET_ID_PARAM, String(target.presetId));
  } else next.set(COMPARE_PRODUCT_URL_PARAM, target.productUrl);

  return next;
};

/**
 * 비교 탭 주소를 만든다 (`/?tab=compare&jobId=…`).
 * 딥링크 진입·로그인 복귀·완료 토스트·이미지 생성 가드가 같은 문자열을 써야 해서 한곳에 모았다.
 */
export const buildCompareTabPath = (target: CompareTabTarget = null): string =>
  `${ROUTES.HOME}?${applyCompareTabParams(new URLSearchParams(), target).toString()}`;
